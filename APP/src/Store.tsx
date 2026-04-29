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
import LoginPage from './LoginPage'; // ✅ Imported your new glassmorphism login page
import FlyingItem from './LayoutComponents/FlyingItem';
import AdminPanel from './LayoutComponents/AdminPanel'; 
import { Invoice } from './LayoutComponents/Invoice';
import CheckoutPage from './CheckoutPage';

interface FlyingItemData { id: number; x: number; y: number; img: string; }

interface OrderSnapshot {
    items: { name: string; quantity: number; price: number }[];
    total: number;
    method: string;
    amountPaid: number;
    change: number;
}

const Store: React.FC = () => {
    // ✅ JWT Auth State
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('access_token'));

    // ✅ FIXED: Load customer from local storage so it survives a page refresh!
    const [loggedInCustomer, setLoggedInCustomer] = useState<Customer | null>(() => {
        const savedCustomer = localStorage.getItem('customer_data');
        try {
            return savedCustomer ? JSON.parse(savedCustomer) : null;
        } catch {
            return null;
        }
    });

    const [products, setProducts] = useState<Product[]>([]);
    const [isManageMode, setIsManageMode] = useState(false);
    const [adminTab, setAdminTab] = useState<'products' | 'customers' | 'invoices'>('products');
    const [cart, setCart] = useState<{product: Product; quantity: number}[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [flyingItems, setFlyingItems] = useState<FlyingItemData[]>([]); 
    const [lastOrderData, setLastOrderData] = useState<OrderSnapshot | null>(null);

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

    // Only load products if authenticated
    useEffect(() => { 
        if (isAuthenticated) {
            loadProducts(); 
        }
    }, [loadProducts, isAuthenticated]);

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
            
            // ✅ JWT Logic: Save tokens
            localStorage.setItem('access_token', res.data.access || res.data.token);
            if (res.data.refresh) localStorage.setItem('refresh_token', res.data.refresh);
            
            // ✅ CRITICAL FIX: Save the actual user data to the browser
            const userData = res.data.user || res.data;
            localStorage.setItem('customer_data', JSON.stringify(userData));
            
            setLoggedInCustomer(userData);
            setIsAuthenticated(true); // Unlocks the page
            setIsAuthModalOpen(false);
            setLoginUsername(''); 
            setLoginPassword('');
        } catch (err) { 
            alert("Invalid login credentials."); 
        } finally { 
            setIsLoadingAuth(false); 
        }
    };

    const handleLogout = () => {
        // ✅ JWT Logic: Clear tokens AND user data on logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('customer_data');
        setIsAuthenticated(false);
        setLoggedInCustomer(null);
    };

    const handleSignup = async () => {
        if (!signupData.username || !signupData.password) return;
        setIsLoadingAuth(true);
        try {
            await customerAPI.addCustomer(signupData);
            setSignupData({ name: '', username: '', email: '', number: '', password: '' });
            setAuthMode('login');
            alert(`Account created! Please log in.`);
        } catch (err) { alert("Signup failed. Username or email might be taken."); }
        finally { setIsLoadingAuth(false); }
    };

    const addToCart = (product: Product, e: React.MouseEvent) => {
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
        setIsCartOpen(false); 
        setIsCheckoutOpen(true); 
    };

    const cartTotal = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
    const filteredProducts = products.filter(p => p.productname.toLowerCase().includes(searchQuery.toLowerCase()));

    // 🛑 BLOCKER: If not authenticated, force the sleek new full-page login
    if (!isAuthenticated) {
        return (
            <LoginPage 
                authMode={authMode} 
                setAuthMode={setAuthMode} 
                isLoading={isLoadingAuth}
                loginUsername={loginUsername} 
                setLoginUsername={setLoginUsername} 
                loginPassword={loginPassword} 
                setLoginPassword={setLoginPassword} 
                handleLogin={handleLogin}
                signupData={signupData} 
                setSignupData={setSignupData} 
                handleSignup={handleSignup}
            />
        );
    }

    // 🟢 AUTHENTICATED: Main Store Interface
    return (
        <div 
            className="min-h-screen w-full flex justify-center overflow-x-hidden relative font-sans bg-cover bg-center bg-fixed"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop')` }}
        >
            <div className="fixed inset-0 bg-slate-950/85 z-0 pointer-events-none"></div>

            <div className="w-full max-w-[1200px] px-5 flex flex-col items-center pb-20 relative z-10">
                <Navbar 
                    isManageMode={isManageMode} 
                    onToggleAdmin={toggleAdminMode} 
                    loggedInCustomer={loggedInCustomer}
                    onOpenAuth={() => setIsAuthModalOpen(true)} 
                    onLogout={handleLogout} 
                    onOpenCart={() => setIsCartOpen(true)} 
                    cartItemCount={cartItemCount}
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

            {/* General Auth Modal (Fallback if opened manually while somehow logged in) */}
            <AnimatePresence>
                {isAuthModalOpen && (
                    <AuthModal 
                        authMode={authMode} setAuthMode={setAuthMode} onClose={() => setIsAuthModalOpen(false)} isLoading={isLoadingAuth}
                        loginUsername={loginUsername} setLoginUsername={setLoginUsername} loginPassword={loginPassword} setLoginPassword={setLoginPassword} handleLogin={handleLogin}
                        signupData={signupData} setSignupData={setSignupData} handleSignup={handleSignup}
                    />
                )}
            </AnimatePresence>

            {/* Checkout Page with Data Capture */}
            <AnimatePresence>
                {isCheckoutOpen && (
                    <CheckoutPage
                        cart={cart}
                        loggedInCustomer={loggedInCustomer}
                        onClose={() => setIsCheckoutOpen(false)}
                        onOrderComplete={(orderSummary: any) => { 
                            setLastOrderData({
                                items: cart.map(i => ({ name: i.product.productname, quantity: i.quantity, price: Number(i.product.price) })),
                                total: orderSummary.total,
                                method: orderSummary.method,
                                amountPaid: orderSummary.amountPaid,
                                change: orderSummary.change
                            });
                            setCart([]); 
                            setIsCheckoutOpen(false); 
                        }}
                        onOpenAuth={() => { setIsCheckoutOpen(false); setIsAuthModalOpen(true); }}
                    />
                )}
            </AnimatePresence>

            {/* Final Invoice Modal Overlay */}
            <AnimatePresence>
                {lastOrderData && (
                    <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-md flex justify-center items-start pt-10 p-4 overflow-y-auto">
                        <div className="w-full max-w-2xl">
                            <Invoice 
                                items={lastOrderData.items}
                                customerName={loggedInCustomer?.name || "Customer"}
                                subtotal={lastOrderData.total / 1.12} 
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