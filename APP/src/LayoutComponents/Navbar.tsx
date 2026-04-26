import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import type { Customer, Invoice, Product } from '../types'; 
import { AnimatePresence, motion } from 'framer-motion';
import { invoiceAPI, productAPI } from '../api'; 

interface NavbarProps {
    isManageMode: boolean;
    onToggleAdmin: () => void;
    loggedInCustomer: Customer | null;
    onOpenAuth: () => void;
    onLogout: () => void;
    onOpenCart: () => void;
    cartItemCount: number;
    // onOpenProfile: () => void; // We can comment this out as we use routing now
}

// ── Track Order Modal Body ─────────────────────────────────────────────────
const TrackOrderBody: React.FC<{ loggedInCustomer: Customer | null }> = ({ loggedInCustomer }) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [products, setProducts] = useState<Record<number, Product>>({});
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!loggedInCustomer) { setLoading(false); return; }
            try {
                const [invoicesRes, productsRes] = await Promise.all([
                    invoiceAPI.getInvoices(),
                    productAPI.getProducts(),
                ]);
                
                const myInvoices = invoicesRes.data.filter(
                    (inv: Invoice) => Number(inv.customer) === Number(loggedInCustomer.customerid)
                );
                
                const productMap: Record<number, Product> = {};
                productsRes.data.forEach((p: Product) => { if (p.productid != null) productMap[p.productid] = p; });
                
                setInvoices(myInvoices);
                setProducts(productMap);
            } catch {
                setError('Failed to load orders. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [loggedInCustomer]);

    if (!loggedInCustomer) return (
        <div className="text-center py-8 space-y-2">
            <div className="text-4xl">🔒</div>
            <p className="text-sm font-bold text-slate-500">Please log in to track your orders.</p>
        </div>
    );

    if (loading) return (
        <div className="text-center py-10 space-y-3">
            <div className="text-3xl animate-bounce">📦</div>
            <p className="text-sm font-bold text-slate-400">Loading your orders...</p>
        </div>
    );

    if (error) return (
        <div className="text-center py-8 space-y-2">
            <div className="text-4xl">⚠️</div>
            <p className="text-sm font-bold text-red-500">{error}</p>
        </div>
    );

    if (invoices.length === 0) return (
        <div className="text-center py-8 space-y-2">
            <div className="text-4xl">🛒</div>
            <p className="text-sm font-bold text-slate-500">You have no orders yet.</p>
        </div>
    );

    return (
        <div className="space-y-3">
            {invoices.map((invoice) => (
                <div key={invoice.invoiceid} className="border border-slate-100 rounded-2xl p-4 space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                        <p className="font-black text-slate-800 text-sm">Invoice #{invoice.invoiceid}</p>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${invoice.is_paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {invoice.is_paid ? 'PAID' : 'PENDING'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                         <p className="font-black text-indigo-600 text-sm">₱{Number(invoice.total).toLocaleString()}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(invoice.date!).toLocaleDateString()}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ── Help Modal Static Content ──────────────────────────────────────────────
const HELP_CONTENT: Record<string, { icon: string; title: string; body: React.ReactNode }> = {
    'Chat with Support': {
        icon: '💬',
        title: 'Chat with Support',
        body: (
            <div className="space-y-4 text-sm text-slate-600">
                <p>Our support team is based in Cagayan de Oro and ready to help!</p>
                <div className="space-y-2">
                    {[
                        { icon: '📧', label: 'Email',    value: 'support@gstop.ph' },
                        { icon: '📞', label: 'Phone',    value: '+63 917 123 4567' },
                        { icon: '💬', label: 'Facebook', value: 'fb.com/gstop' },
                    ].map(({ icon, label, value }) => (
                        <div key={label} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                            <span className="text-xl shrink-0">{icon}</span>
                            <div>
                                <p className="font-bold text-slate-700 text-xs uppercase tracking-wide">{label}</p>
                                <p className="font-bold text-indigo-600 text-sm">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    'FAQs': {
        icon: '📋',
        title: 'Frequently Asked Questions',
        body: (
            <div className="space-y-3 text-sm">
                {[
                    { q: 'How do I place an order?', a: 'Browse our products, add to cart, and check out.' },
                    { q: 'Payment methods?', a: 'We accept GCash, Maya, cards, and COD.' },
                ].map(({ q, a }) => (
                    <div key={q} className="bg-slate-50 rounded-xl p-3">
                        <p className="font-bold text-slate-800 mb-1 text-xs">❓ {q}</p>
                        <p className="text-slate-500 text-xs leading-relaxed">{a}</p>
                    </div>
                ))}
            </div>
        ),
    },
};

const SAMPLE_NOTIFICATIONS = [
    { id: 1, icon: '🛍️', title: 'Order Confirmed', message: 'Your order #1042 has been confirmed.', time: '2m ago', read: false },
    { id: 2, icon: '🚚', title: 'Out for Delivery', message: 'Your order #1039 is on its way!', time: '1h ago', read: false },
];

const Navbar: React.FC<NavbarProps> = ({
    isManageMode, loggedInCustomer, onOpenAuth, onLogout, onOpenCart, cartItemCount
}) => {
    const navigate = useNavigate(); // 2. Initialize navigate hook
    const [showNotifications, setShowNotifications] = useState(false);
    const [showHelp, setShowHelp]                   = useState(false);
    const [notifications, setNotifications]         = useState(SAMPLE_NOTIFICATIONS);
    const [helpModal, setHelpModal]                 = useState<string | null>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const helpRef  = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
            if (helpRef.current && !helpRef.current.contains(e.target as Node)) setShowHelp(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const openHelpModal = (label: string) => { setHelpModal(label); setShowHelp(false); };

    const isTrackOrder  = helpModal === 'Track My Order';
    const activeHelp    = helpModal && !isTrackOrder ? HELP_CONTENT[helpModal] : null;

    return (
        <>
            <nav className="w-full flex justify-between items-center py-6">
                {/* Logo - Click to go home */}
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-200">G</div>
                    <h1 className="text-2xl font-black text-white tracking-tight">G-Stop</h1>
                </div>

                <div className="flex gap-3 items-center">
                    {!isManageMode && (
                        <>
                            {/* Help Dropdown */}
                            <div className="relative" ref={helpRef}>
                                <button onClick={() => setShowHelp(p => !p)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-all">
                                    <span className="text-base">❓</span>
                                    <span className="hidden sm:inline">Help</span>
                                </button>
                                <AnimatePresence>
                                    {showHelp && (
                                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                                            {['Track My Order', 'Chat with Support', 'FAQs'].map(label => (
                                                <button key={label} onClick={() => openHelpModal(label)} className="w-full px-4 py-3 text-sm font-bold text-slate-600 hover:bg-indigo-50 text-left transition-colors">{label}</button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Notifications */}
                            <div className="relative" ref={notifRef}>
                                <button onClick={() => setShowNotifications(p => !p)} className="relative p-2.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100">
                                    <span className="text-xl">🔔</span>
                                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">{unreadCount}</span>}
                                </button>
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                                            <div className="px-4 py-3 border-b flex justify-between"><p className="text-sm font-black">Notifications</p></div>
                                            <div className="max-h-72 overflow-y-auto">
                                                {notifications.map(n => <div key={n.id} className="p-4 border-b text-sm"><strong>{n.title}</strong><p className="text-xs text-slate-500">{n.message}</p></div>)}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* User Profile Button - NAVIGATES TO /profile */}
                            {loggedInCustomer ? (
                                <div className="flex items-center gap-2 pl-3 border-l border-white/10">
                                    <button 
                                        onClick={() => navigate('/profile')} 
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-all text-left"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-xs shadow-md">
                                            {loggedInCustomer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">Account</p>
                                            <p className="text-sm font-bold text-white truncate max-w-[100px]">{loggedInCustomer.name}</p>
                                        </div>
                                    </button>
                                    <button onClick={onLogout} className="text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/20">Logout</button>
                                </div>
                            ) : (
                                <button onClick={onOpenAuth} className="px-5 py-2 text-sm font-bold bg-slate-800 text-white rounded-lg hover:bg-slate-700">Login</button>
                            )}

                            {/* Cart Icon */}
                            <motion.button onClick={onOpenCart} className="relative p-3 bg-white rounded-full shadow-sm border border-slate-200">
                                <span className="text-xl">🛒</span>
                                {cartItemCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-6 w-6 rounded-full flex items-center justify-center border-2 border-white font-bold">{cartItemCount}</span>}
                            </motion.button>
                        </>
                    )}
                </div>
            </nav>

            {/* Modals for Help Center */}
            <AnimatePresence>
                {helpModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[70]" onClick={() => setHelpModal(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                            <div className="px-6 py-4 border-b flex justify-between items-center">
                                <h2 className="text-base font-black text-slate-800">{helpModal}</h2>
                                <button onClick={() => setHelpModal(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
                            </div>
                            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
                                {isTrackOrder ? <TrackOrderBody loggedInCustomer={loggedInCustomer} /> : activeHelp?.body}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;