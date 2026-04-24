import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';

import type { Product, Customer, Invoice as InvoiceType } from './types'; 
import { productAPI, customerAPI, invoiceAPI } from './api'; 

// Layout Components
import Navbar from './LayoutComponents/Navbar';
import Hero from './LayoutComponents/Hero';
import ProductGrid from './LayoutComponents/ProductGrid';
import CartDrawer from './LayoutComponents/CartDrawer';
import AuthModal from './LayoutComponents/AuthModal';
import FlyingItem from './LayoutComponents/FlyingItem';
import AdminPanel from './LayoutComponents/AdminPanel'; 
import { Invoice } from './LayoutComponents/Invoice';    // <--- Ensure this is imported
import CheckoutPage from './CheckoutPage';
<<<<<<< HEAD
=======
import ProfilePage from './ProfilePage';
>>>>>>> 535df5c (with profile)

interface FlyingItemData { id: number; x: number; y: number; img: string; }

// Define a type for the success snapshot
interface OrderSnapshot {
    items: { name: string; quantity: number; price: number }[];
    total: number;
    method: string;
    amountPaid: number;
    change: number;
}

const Store: React.FC = () => {
    // ... (Keep existing states)
    const [products, setProducts] = useState<Product[]>([]);
    const [isManageMode, setIsManageMode] = useState(false);
    const [adminTab, setAdminTab] = useState<'products' | 'customers' | 'invoices'>('products');
    const [cart, setCart] = useState<{product: Product; quantity: number}[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [flyingItems, setFlyingItems] = useState<FlyingItemData[]>([]); 

    // ✅ NEW STATE: To hold the data for the Invoice after order is placed
    const [lastOrderData, setLastOrderData] = useState<OrderSnapshot | null>(null);

    // ... (Keep existing Auth states and handlers)
    const [loggedInCustomer, setLoggedInCustomer] = useState<Customer | null>(null);
<<<<<<< HEAD
=======
    const [isProfileOpen, setIsProfileOpen] = useState(false);
>>>>>>> 535df5c (with profile)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [isLoadingAuth, setIsLoadingAuth] = useState(false);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupData, setSignupData] = useState({ name: '', username: '', email: '', number: '', password: '' });

    const loadProducts = useCallback(async () => {
        try {
            const res = await productAPI.getProducts();
            setProducts(res.data);
        } catch (err) { console.error("Error loading products:", err); }
    }, []);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    const toggleAdminMode = () => {
        if (isManageMode) { setIsManageMode(false); } 
        else {
            const password = prompt("Enter Admin Password:");
            if (password === "admin123") setIsManageMode(true);
        }
    };

    const handleLogin = async () => {
        if (!loginUsername || !loginPassword) return;
        setIsLoadingAuth(true);
        try {
            const res = await customerAPI.loginCustomer({ username: loginUsername, password: loginPassword });
            setLoggedInCustomer(res.data);
            setIsAuthModalOpen(false);
            setLoginUsername(''); setLoginPassword('');
        } catch (err) { alert("Invalid login."); }
        finally { setIsLoadingAuth(false); }
    };

    const handleSignup = async () => {
        if (!signupData.username || !signupData.password) return;
        setIsLoadingAuth(true);
        try {
            await customerAPI.addCustomer(signupData);
            setSignupData({ name: '', username: '', email: '', number: '', password: '' });
            setAuthMode('login');
            alert(`Account created!`);
        } catch (err) { alert("Signup failed."); }
        finally { setIsLoadingAuth(false); }
    };

    const addToCart = (product: Product, e: React.MouseEvent) => {
    // We are completely removing the picsum.photos fallback here.
    // We force it to use EXACTLY the string from your console log!
    const newItem: FlyingItemData = { 
        id: Date.now(), 
        x: e.clientX, 
        y: e.clientY, 
        img: product.image || ""
    };

    setFlyingItems(prev => [...prev, newItem]);
    
    setCart(prev => {
        const existing = prev.find(item => item.product.productid === product.productid);
        if (existing) {
            return prev.map(item => item.product.productid === product.productid 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            );
        }
        return [...prev, { product, quantity: 1 }];
    });
};

    const handleInitiateCheckout = () => {
        if (!loggedInCustomer) { setIsAuthModalOpen(true); return; }
        setIsCartOpen(false); 
        setIsCheckoutOpen(true); 
    };

    const cartTotal = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
    const filteredProducts = products.filter(p => p.productname.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div 
            className="min-h-screen w-full flex justify-center overflow-x-hidden relative font-sans bg-cover bg-center bg-fixed"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop')` }}
        >
            {/* 🎮 2. The dark overlay so you can still read the text */}
            <div className="fixed inset-0 bg-slate-950/85 z-0 pointer-events-none"></div>

            {/* 🎮 3. This holds your Navbar, Hero, and Products */}
            <div className="w-full max-w-[1200px] px-5 flex flex-col items-center pb-20 relative z-10">
                <Navbar 
                    isManageMode={isManageMode} onToggleAdmin={toggleAdminMode} loggedInCustomer={loggedInCustomer}
                    onOpenAuth={() => setIsAuthModalOpen(true)} onLogout={() => setLoggedInCustomer(null)}
                    onOpenCart={() => setIsCartOpen(true)} cartItemCount={cartItemCount}
<<<<<<< HEAD
=======
                    onOpenProfile={() => setIsProfileOpen(true)}
>>>>>>> 535df5c (with profile)
                />

                {!isManageMode ? (
                    <>
                        <Hero loggedInCustomer={loggedInCustomer} />
                        <ProductGrid products={filteredProducts} searchQuery={searchQuery} onSearchChange={setSearchQuery} onAddToCart={addToCart} />
                    </>
                ) : (
                    <AdminPanel adminTab={adminTab} setAdminTab={setAdminTab} products={products} loadProducts={loadProducts} />
                )}
            </div>

            {/* Flying Items */}
            {flyingItems.map(item => (
                <FlyingItem key={item.id} x={item.x} y={item.y} image={item.img} onComplete={() => setFlyingItems(prev => prev.filter(i => i.id !== item.id))} />
            ))}

            {/* Cart Drawer */}
            <AnimatePresence>
                {isCartOpen && (
                    <CartDrawer 
                        cart={cart} onClose={() => setIsCartOpen(false)} onRemove={(id) => setCart(prev => prev.filter(i => i.product.productid !== id))}
                        total={cartTotal} loggedInCustomer={loggedInCustomer} onCheckout={handleInitiateCheckout} 
                        onOpenAuth={() => { setIsCartOpen(false); setIsAuthModalOpen(true); }}
                    />
                )}
            </AnimatePresence>

            {/* Auth Modal */}
            {isAuthModalOpen && (
                <AuthModal 
                    authMode={authMode} setAuthMode={setAuthMode} onClose={() => setIsAuthModalOpen(false)} isLoading={isLoadingAuth}
                    loginUsername={loginUsername} setLoginUsername={setLoginUsername} loginPassword={loginPassword} setLoginPassword={setLoginPassword} handleLogin={handleLogin}
                    signupData={signupData} setSignupData={setSignupData} handleSignup={handleSignup}
                />
            )}

            {/* ✅ UPDATED: Checkout Page with Data Capture */}
            <AnimatePresence>
                {isCheckoutOpen && (
                    <CheckoutPage
                        cart={cart}
                        loggedInCustomer={loggedInCustomer}
                        onClose={() => setIsCheckoutOpen(false)}
                        onOrderComplete={(orderSummary: any) => { 
                            // 1. Save the snapshot of what was just bought
                            setLastOrderData({
                                items: cart.map(i => ({ name: i.product.productname, quantity: i.quantity, price: Number(i.product.price) })),
                                total: orderSummary.total,
                                method: orderSummary.method,
                                amountPaid: orderSummary.amountPaid,
                                change: orderSummary.change
                            });
                            // 2. Cleanup
                            setCart([]); 
                            setIsCheckoutOpen(false); 
                        }}
                        onOpenAuth={() => { setIsCheckoutOpen(false); setIsAuthModalOpen(true); }}
                    />
                )}
            </AnimatePresence>

<<<<<<< HEAD
=======
            {/* ✅ NEW: Profile Page */}
            <AnimatePresence>
                {isProfileOpen && (
                    <ProfilePage
                        loggedInCustomer={loggedInCustomer}
                        onClose={() => setIsProfileOpen(false)}
                        onLogout={() => { setLoggedInCustomer(null); setIsProfileOpen(false); }}
                        onCustomerUpdate={(updated) => setLoggedInCustomer(updated)}
                    />
                )}
            </AnimatePresence>

>>>>>>> 535df5c (with profile)
            {/* ✅ NEW: Final Invoice Modal Overlay */}
            <AnimatePresence>
                {lastOrderData && (
                    <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-md flex justify-center items-start pt-10 p-4 overflow-y-auto">
                        <div className="w-full max-w-2xl">
                            <Invoice 
                                items={lastOrderData.items}
                                customerName={loggedInCustomer?.name}
                                subtotal={lastOrderData.total / 1.12} // Deducting VAT for subtotal display
                                paymentMethod={lastOrderData.method}
                                amountPaid={lastOrderData.amountPaid}
                                change={lastOrderData.change}
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