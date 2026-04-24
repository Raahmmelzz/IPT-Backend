import React, { useState, useRef, useEffect } from 'react';
import type { Customer, Invoice, Product } from '../types'; // <-- Swapped Order for Invoice
import { AnimatePresence, motion } from 'framer-motion';
import { invoiceAPI, productAPI } from '../api';            // <-- Swapped orderAPI for invoiceAPI

interface NavbarProps {
    isManageMode: boolean;
    onToggleAdmin: () => void;
    loggedInCustomer: Customer | null;
    onOpenAuth: () => void;
    onLogout: () => void;
    onOpenCart: () => void;
    cartItemCount: number;
<<<<<<< HEAD
=======
    onOpenProfile: () => void;
>>>>>>> 535df5c (with profile)
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
                
                // Filter invoices for the logged-in customer
                const myInvoices = invoicesRes.data.filter(
                    (inv: Invoice) => Number(inv.customer) === Number(loggedInCustomer.customerid)
                );
                
                // Map products by ID for easy lookup
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
            <p className="text-xs text-slate-400">Start shopping and your orders will appear here!</p>
        </div>
    );

    return (
        <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                {invoices.length} order{invoices.length > 1 ? 's' : ''} found
            </p>
            {invoices.map((invoice) => {
                const date = invoice.date ? new Date(invoice.date) : null;
                const formattedDate = date ? date.toLocaleDateString('en-PH', {
                    year: 'numeric', month: 'short', day: 'numeric'
                }) : 'N/A';
                
                // Summarize items for the new Invoice structure
                const totalQty = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
                const firstItem = invoice.items[0];
                const firstProduct = firstItem ? products[firstItem.product] : null;
                const productDisplayName = firstProduct ? firstProduct.productname : 'Unknown Product';
                const moreItemsText = invoice.items.length > 1 ? ` (+${invoice.items.length - 1} more)` : '';

                return (
                    <div key={invoice.invoiceid} className="border border-slate-100 rounded-2xl p-4 space-y-3 hover:border-indigo-200 transition-colors">
                        {/* Order header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-wide">Invoice</p>
                                <p className="font-black text-slate-800 text-sm">#{invoice.invoiceid}</p>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${invoice.is_paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {invoice.is_paid ? '✅ Paid' : '⏳ Pending'}
                            </span>
                        </div>

                        {/* Product info */}
                        <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                            <span className="text-2xl">🛍️</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 text-sm truncate">
                                    {productDisplayName}{moreItemsText}
                                </p>
                                <p className="text-xs text-slate-500">Total Qty: {totalQty}</p>
                            </div>
                            <p className="font-black text-indigo-600 text-sm shrink-0">
                                ₱{Number(invoice.total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </p>
                        </div>

                        {/* Order date */}
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>📅 Ordered on {formattedDate}</span>
                            <span className="font-bold text-slate-500">ETA: 3–7 days</span>
                        </div>

                        {/* Mini progress bar */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                <span>Placed</span>
                                <span>Processing</span>
                                <span>Shipped</span>
                                <span>Delivered</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full">
                                <div className="h-1.5 bg-indigo-500 rounded-full w-2/4 transition-all duration-500" />
                            </div>
                        </div>
                    </div>
                );
            })}
            <div className="bg-indigo-50 rounded-xl p-3">
                <p className="text-xs font-bold text-indigo-700">📬 Standard delivery: 3–7 business days. For help, contact our support team.</p>
            </div>
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
                <p>Our support team is based in Cagayan de Oro and ready to help you with any concern!</p>
                <div className="space-y-2">
                    {[
                        { icon: '📧', label: 'Email',    value: 'support@gstop.ph',   sub: 'Response within 24 hours' },
                        { icon: '📞', label: 'Phone',    value: '+63 917 123 4567',        sub: 'Mon–Sat, 8AM–6PM' },
                        { icon: '💬', label: 'Facebook', value: 'fb.com/gstop',        sub: 'Usually replies instantly' },
                        { icon: '📍', label: 'Location', value: 'Cagayan de Oro City',     sub: 'Misamis Oriental, PH' },
                    ].map(({ icon, label, value, sub }) => (
                        <div key={label} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                            <span className="text-xl shrink-0">{icon}</span>
                            <div>
                                <p className="font-bold text-slate-700 text-xs uppercase tracking-wide">{label}</p>
                                <p className="font-bold text-indigo-600 text-sm">{value}</p>
                                <p className="text-slate-400 text-xs">{sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-yellow-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-yellow-700">⚡ For urgent concerns, calling or messaging us on Facebook is the fastest way to get help.</p>
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
                    { q: 'How do I place an order?', a: 'Browse our products, add items to your cart, then check out. You need to be logged in to complete a purchase.' },
                    { q: 'What payment methods do you accept?', a: 'We accept GCash, Maya, credit/debit cards (Visa & Mastercard), and Cash on Delivery (COD) for select areas.' },
                    { q: 'Can I cancel my order?', a: 'Yes, orders can be cancelled within 1 hour of placement. After that, please contact support as the order may already be packed.' },
                    { q: 'Do you ship nationwide?', a: 'Yes! We ship to all provinces in the Philippines. Delivery times vary by location — Metro areas get faster delivery.' },
                    { q: 'Is my payment information secure?', a: 'Absolutely. All transactions are encrypted and we never store your card details on our servers.' },
                    { q: 'How do I contact support?', a: 'You can reach us via email at support@gstop.ph, call +63 917 123 4567, or message us on Facebook.' },
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

// ── Sample notifications ───────────────────────────────────────────────────
const SAMPLE_NOTIFICATIONS = [
    { id: 1, icon: '🛍️', title: 'Order Confirmed', message: 'Your order #1042 has been confirmed.', time: '2m ago', read: false },
    { id: 2, icon: '🚚', title: 'Out for Delivery', message: 'Your order #1039 is on its way!', time: '1h ago', read: false },
    { id: 3, icon: '✅', title: 'Order Delivered', message: 'Order #1035 was delivered successfully.', time: '2d ago', read: true },
    { id: 4, icon: '🎉', title: 'Welcome to G-stop!', message: 'Thanks for signing up. Enjoy shopping!', time: '5d ago', read: true },
];

const Navbar: React.FC<NavbarProps> = ({
<<<<<<< HEAD
    isManageMode, onToggleAdmin, loggedInCustomer, onOpenAuth, onLogout, onOpenCart, cartItemCount
=======
    isManageMode, onToggleAdmin, loggedInCustomer, onOpenAuth, onLogout, onOpenCart, cartItemCount, onOpenProfile
>>>>>>> 535df5c (with profile)
}) => {
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

    // Determine modal content — Track My Order is dynamic, others are static
    const isTrackOrder  = helpModal === 'Track My Order';
    const activeHelp    = helpModal && !isTrackOrder ? HELP_CONTENT[helpModal] : null;

    return (
        <>
            <nav className="w-full flex justify-between items-center py-6">
                {/* Logo */}
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-200">G</div>
                    <h1 className="text-2xl font-black text-white tracking-tight">G-Stop</h1>
                </div>

                {/* Actions */}
                <div className="flex gap-3 items-center">

                    {!isManageMode && (
                        <>
                            {/* ── HELP ── */}
                            <div className="relative" ref={helpRef}>
                                <button onClick={() => { setShowHelp(p => !p); setShowNotifications(false); }}
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-all">
                                    <span className="text-base">❓</span>
                                    <span className="hidden sm:inline">Help</span>
                                </button>
                                <AnimatePresence>
                                    {showHelp && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                                            <div className="px-4 py-3 border-b border-slate-100">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Help Center</p>
                                            </div>
                                            {[
                                                { icon: '📦', label: 'Track My Order' },
                                                { icon: '💬', label: 'Chat with Support' },
                                                { icon: '📋', label: 'FAQs' },
                                            ].map(item => (
                                                <button key={item.label}
                                                    onClick={() => openHelpModal(item.label)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left">
                                                    <span>{item.icon}</span>
                                                    {item.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* ── NOTIFICATIONS ── */}
                            <div className="relative" ref={notifRef}>
                                <button onClick={() => { setShowNotifications(p => !p); setShowHelp(false); }}
                                    className="relative p-2.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-all">
                                    <span className="text-xl">🔔</span>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                                                <p className="text-sm font-black text-slate-800">Notifications</p>
                                                {unreadCount > 0 && (
                                                    <button onClick={markAllRead} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>
                                            {loggedInCustomer ? (
                                                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                                                    {notifications.map(notif => (
                                                        <button key={notif.id}
                                                            onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                                                            className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-indigo-50/50' : ''}`}>
                                                            <span className="text-xl mt-0.5 shrink-0">{notif.icon}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className={`text-sm font-bold truncate ${!notif.read ? 'text-slate-800' : 'text-slate-600'}`}>{notif.title}</p>
                                                                    <span className="text-xs text-slate-400 shrink-0">{notif.time}</span>
                                                                </div>
                                                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                                            </div>
                                                            {!notif.read && <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-10 px-4 gap-3">
                                                    <span className="text-5xl">🔔</span>
                                                    <p className="text-sm font-bold text-slate-500 text-center">Log in to view your notifications</p>
                                                    <button onClick={() => { onOpenAuth(); setShowNotifications(false); }}
                                                        className="mt-1 px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                                                        Login
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* ── USER / AUTH ── */}
                            {loggedInCustomer ? (
<<<<<<< HEAD
                                <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-slate-500 font-bold text-white uppercase tracking-wider">Logged in as</p>
                                        <p className="text-sm font-bold text-white text-slate-800">{loggedInCustomer.name}</p>
                                    </div>
                                    <button onClick={onLogout} className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
=======
                                <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                                    <button
                                        onClick={onOpenProfile}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-sm shadow-md">
                                            {loggedInCustomer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
                                        <div className="text-left hidden sm:block">
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Logged in as</p>
                                            <p className="text-sm font-bold text-white leading-tight">{loggedInCustomer.name}</p>
                                        </div>
                                    </button>
                                    <button onClick={onLogout} className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors">
>>>>>>> 535df5c (with profile)
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <button onClick={onOpenAuth} className="px-5 py-2 text-sm font-bold bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                                    Login
                                </button>
                            )}

                            {/* ── CART ── */}
                            <motion.button
                                id="cart-icon-target"
                                key={cartItemCount}
                                initial={{ scale: 1 }}
                                animate={cartItemCount > 0 ? { scale: [1, 1.4, 1], rotate: [0, -15, 15, 0] } : {}}
                                transition={{ duration: 0.4, delay: 1.15, ease: "easeOut" }}
                                onClick={onOpenCart}
                                className="relative p-3 bg-white rounded-full shadow-sm border border-slate-200 hover:shadow-md transition-all flex items-center justify-center ml-1">
                                <span className="text-xl">🛒</span>
                                <AnimatePresence>
                                    {cartItemCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{ delay: 1.15 }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                            {cartItemCount}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </>
                    )}
                </div>
            </nav>

            {/* ══════════════ HELP MODAL ══════════════ */}
            <AnimatePresence>
                {helpModal && (isTrackOrder || activeHelp) && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[70]"
                        onClick={() => setHelpModal(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.2 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{isTrackOrder ? '📦' : activeHelp?.icon}</span>
                                    <h2 className="text-base font-black text-slate-800">
                                        {isTrackOrder ? 'Track My Order' : activeHelp?.title}
                                    </h2>
                                </div>
                                <button onClick={() => setHelpModal(null)}
                                    className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none transition-colors">
                                    ✕
                                </button>
                            </div>
                            {/* Body */}
                            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
                                {isTrackOrder
                                    ? <TrackOrderBody loggedInCustomer={loggedInCustomer} />
                                    : activeHelp?.body
                                }
                            </div>
                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                                <button onClick={() => setHelpModal(null)}
                                    className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm">
                                    Got it!
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;