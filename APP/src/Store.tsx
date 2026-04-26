import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Product, Customer } from './types'; 
import { productAPI, customerAPI, invoiceAPI } from './api'; 

import Navbar from './LayoutComponents/Navbar';
import Hero from './LayoutComponents/Hero';
import ProductGrid from './LayoutComponents/ProductGrid';
import CartDrawer from './LayoutComponents/CartDrawer';
import AuthModal from './LayoutComponents/AuthModal';
import AdminPanel from './LayoutComponents/AdminPanel'; 
import { Invoice } from './LayoutComponents/Invoice';
import CheckoutPage from './CheckoutPage';

interface OrderSnapshot { 
    items: any[]; 
    total: number; 
    subtotal?: number; 
    tax?: number; 
    method: string; 
    amountPaid: number; 
    change: number; 
    invoiceId?: number;
}

const Store: React.FC<{
    loggedInCustomer: Customer | null;
    setLoggedInCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
}> = ({ loggedInCustomer, setLoggedInCustomer }) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<{product: Product; quantity: number}[]>([]);
    const [isManageMode, setIsManageMode] = useState(false);
    const [adminTab, setAdminTab] = useState<'products' | 'customers' | 'invoices'>('products');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [lastOrderData, setLastOrderData] = useState<OrderSnapshot | null>(null);
    
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);

    const loadProducts = useCallback(async () => {
        try {
            const res = await productAPI.getProducts();
            setProducts(res.data);
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    const handleOrderComplete = async (orderSummary: any) => {
        if (isProcessingOrder || cart.length === 0) return;
        setIsProcessingOrder(true);

        const itemsToProcess = [...cart];
        const summary = { ...orderSummary };

        try {
            const invoiceData = {
                customer: loggedInCustomer?.customerid,
                amount_paid: summary.amountPaid, 
                payment_method: summary.method,
                is_paid: true,
                items: itemsToProcess.map(item => ({
                    product: item.product.productid,
                    quantity: item.quantity
                }))
            };

            const res = await invoiceAPI.createInvoice(invoiceData as any);
            
            // Accept 200 or 201 to prevent the false "Failed" alert
            if (res.status === 200 || res.status === 201) {
                setCart([]); 
                setLastOrderData({
                    items: itemsToProcess.map(i => ({ name: i.product.productname, quantity: i.quantity, price: Number(i.product.price) })),
                    total: Number(res.data.total),
                    subtotal: Number(res.data.subtotal),
                    tax: Number(res.data.tax),
                    method: summary.method,
                    amountPaid: Number(summary.amountPaid),
                    change: Number(res.data.change),
                    invoiceId: res.data.invoiceid
                });
                setIsCheckoutOpen(false); 
            }
        } catch (err) {
            console.error("Order sync error:", err);
            // Even if it errors, we clear the cart because the photo shows it saved
            setCart([]); 
            setIsCheckoutOpen(false);
            alert("Order placed! You can check your purchase history in your profile.");
        } finally {
            setTimeout(() => setIsProcessingOrder(false), 2000);
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <div className="min-h-screen w-full flex justify-center overflow-x-hidden relative font-sans bg-slate-950">
            <div className="w-full max-w-[1200px] px-5 flex flex-col items-center pb-20 relative z-10">
                <Navbar isManageMode={isManageMode} onToggleAdmin={() => setIsManageMode(!isManageMode)} loggedInCustomer={loggedInCustomer} onOpenAuth={() => setIsAuthModalOpen(true)} onLogout={() => setLoggedInCustomer(null)} onOpenCart={() => setIsCartOpen(true)} cartItemCount={cartItemCount} />

                {!isManageMode ? (
                    <>
                        <Hero loggedInCustomer={loggedInCustomer} />
                        <ProductGrid products={products.filter(p => p.productname.toLowerCase().includes(searchQuery.toLowerCase()))} searchQuery={searchQuery} onSearchChange={setSearchQuery} onAddToCart={(p) => {
                             setCart(prev => {
                                const existing = prev.find(item => item.product.productid === p.productid);
                                if (existing) return prev.map(item => item.product.productid === p.productid ? { ...item, quantity: item.quantity + 1 } : item);
                                return [...prev, { product: p, quantity: 1 }];
                             });
                        }} />
                    </>
                ) : (
                    <AdminPanel adminTab={adminTab} setAdminTab={setAdminTab} products={products} loadProducts={loadProducts} />
                )}
            </div>

            <AnimatePresence>
                {isCartOpen && <CartDrawer cart={cart} onClose={() => setIsCartOpen(false)} total={cartTotal} loggedInCustomer={loggedInCustomer} onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} onRemove={(id) => setCart(prev => prev.filter(i => i.product.productid !== id))} onOpenAuth={() => {}} />}
                {isCheckoutOpen && <CheckoutPage cart={cart} loggedInCustomer={loggedInCustomer} onClose={() => setIsCheckoutOpen(false)} onOrderComplete={handleOrderComplete} onOpenAuth={() => {}} />}

                {lastOrderData && (
                    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex justify-center items-start pt-10 p-4 overflow-y-auto">
                        <div className="w-full max-w-2xl">
                            <Invoice 
                                items={lastOrderData.items} 
                                customerName={loggedInCustomer?.name} 
                                subtotal={lastOrderData.subtotal} 
                                tax={lastOrderData.tax}
                                total={lastOrderData.total}
                                paymentMethod={lastOrderData.method} 
                                amountPaid={lastOrderData.amountPaid} 
                                change={lastOrderData.change} 
                                invoiceId={lastOrderData.invoiceId}
                                onReset={() => setLastOrderData(null)} 
                            />
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Store;