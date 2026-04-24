import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Customer, Invoice, Product } from './types';
import { customerAPI, invoiceAPI, productAPI } from './api';

interface ProfilePageProps {
    loggedInCustomer: Customer | null;
    onClose: () => void;
    onLogout: () => void;
    onCustomerUpdate: (updated: Customer) => void;
}

type Tab = 'overview' | 'orders' | 'settings';

const ProfilePage: React.FC<ProfilePageProps> = ({
    loggedInCustomer,
    onClose,
    onLogout,
    onCustomerUpdate,
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [products, setProducts] = useState<Record<number, Product>>({});
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: loggedInCustomer?.name || '',
        email: loggedInCustomer?.email || '',
        number: loggedInCustomer?.number || '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Password change state
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    useEffect(() => {
        if (loggedInCustomer) {
            setEditData({
                name: loggedInCustomer.name,
                email: loggedInCustomer.email,
                number: loggedInCustomer.number,
            });
        }
    }, [loggedInCustomer]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!loggedInCustomer) { setLoadingOrders(false); return; }
            try {
                const [invRes, prodRes] = await Promise.all([
                    invoiceAPI.getInvoices(),
                    productAPI.getProducts(),
                ]);
                const myInvoices = invRes.data.filter(
                    (inv: Invoice) => Number(inv.customer) === Number(loggedInCustomer.customerid)
                );
                const productMap: Record<number, Product> = {};
                prodRes.data.forEach((p: Product) => { if (p.productid != null) productMap[p.productid] = p; });
                setInvoices(myInvoices);
                setProducts(productMap);
            } catch (e) {
                console.error('Failed to load orders', e);
            } finally {
                setLoadingOrders(false);
            }
        };
        fetchOrders();
    }, [loggedInCustomer]);

    const totalSpent = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
    const paidOrders = invoices.filter(inv => inv.is_paid).length;

    const handleSaveProfile = async () => {
        if (!loggedInCustomer?.customerid) return;
        setIsSaving(true);
        setSaveError('');
        setSaveSuccess(false);
        try {
            const res = await customerAPI.updateCustomer(loggedInCustomer.customerid, editData);
            onCustomerUpdate(res.data);
            setSaveSuccess(true);
            setIsEditing(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setSaveError('Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordError('');
        setPasswordSuccess(false);
        if (!passwordData.current) { setPasswordError('Please enter your current password.'); return; }
        if (passwordData.newPass.length < 6) { setPasswordError('New password must be at least 6 characters.'); return; }
        if (passwordData.newPass !== passwordData.confirm) { setPasswordError('Passwords do not match.'); return; }
        if (!loggedInCustomer?.customerid) return;

        setIsSaving(true);
        try {
            await customerAPI.updateCustomer(loggedInCustomer.customerid, { password: passwordData.newPass });
            setPasswordSuccess(true);
            setPasswordData({ current: '', newPass: '', confirm: '' });
            setShowPasswordSection(false);
            setTimeout(() => setPasswordSuccess(false), 4000);
        } catch (err) {
            setPasswordError('Failed to update password.');
        } finally {
            setIsSaving(false);
        }
    };

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const avatarColors = ['from-indigo-500 to-purple-600', 'from-emerald-500 to-teal-600', 'from-orange-500 to-rose-600'];
    const avatarColor = avatarColors[(loggedInCustomer?.customerid || 0) % avatarColors.length];

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'overview', label: 'Overview', icon: '👤' },
        { key: 'orders', label: 'Order History', icon: '📦' },
        { key: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 30 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* ── Hero Banner ── */}
                <div className="relative h-32 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 overflow-hidden">
                    <div className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center font-bold text-lg transition-all backdrop-blur-sm"
                    >
                        ✕
                    </button>
                </div>

                {/* ── Avatar + Name ── */}
                <div className="px-8 pb-0">
                    <div className="flex items-end gap-5 -mt-14 mb-4">
                        <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-3xl font-black shadow-xl border-4 border-white shrink-0`}>
                            {loggedInCustomer ? getInitials(loggedInCustomer.name) : '?'}
                        </div>
                        <div className="pb-2">
                            <h2 className="text-xl font-black text-slate-800 leading-tight">
                                {loggedInCustomer?.name || 'Guest'}
                            </h2>
                            <p className="text-sm text-slate-500 font-bold">@{loggedInCustomer?.username}</p>
                        </div>
                        <div className="ml-auto pb-2 flex gap-2">
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* ── Quick Stats ── */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        {[
                            { label: 'Total Orders', value: invoices.length, icon: '📦', color: 'text-indigo-600' },
                            { label: 'Paid Orders', value: paidOrders, icon: '✅', color: 'text-emerald-600' },
                            { label: 'Total Spent', value: `₱${totalSpent.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`, icon: '💳', color: 'text-purple-600' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-slate-50 rounded-2xl p-3 text-center">
                                <p className="text-2xl mb-1">{stat.icon}</p>
                                <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
                                <p className="text-xs font-bold text-slate-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── Tabs ── */}
                    <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-5">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    activeTab === tab.key
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Tab Content ── */}
                <div className="px-8 pb-8 max-h-[42vh] overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {/* ══ OVERVIEW TAB ══ */}
                        {activeTab === 'overview' && (
                            <motion.div key="overview"
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.15 }}
                                className="space-y-3"
                            >
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Account Information</h3>
                                {[
                                    { icon: '👤', label: 'Full Name', value: loggedInCustomer?.name },
                                    { icon: '🏷️', label: 'Username', value: `@${loggedInCustomer?.username}` },
                                    { icon: '📧', label: 'Email', value: loggedInCustomer?.email || '—' },
                                    { icon: '📞', label: 'Phone', value: loggedInCustomer?.number ? `+63 ${loggedInCustomer.number}` : '—' },
                                ].map(field => (
                                    <div key={field.label} className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">
                                        <span className="text-xl w-8 text-center shrink-0">{field.icon}</span>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{field.label}</p>
                                            <p className="font-bold text-slate-800">{field.value || '—'}</p>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className="w-full mt-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all"
                                >
                                    ✏️ Edit Profile
                                </button>
                            </motion.div>
                        )}

                        {/* ══ ORDERS TAB ══ */}
                        {activeTab === 'orders' && (
                            <motion.div key="orders"
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.15 }}
                            >
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Order History</h3>
                                {loadingOrders ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                                        <div className="text-4xl animate-bounce">📦</div>
                                        <p className="text-sm font-bold text-slate-400">Loading orders...</p>
                                    </div>
                                ) : invoices.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                                        <div className="text-5xl">🛒</div>
                                        <p className="font-bold text-slate-600">No orders yet</p>
                                        <p className="text-xs text-slate-400">Start shopping and your orders will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {invoices.map(inv => {
                                            const date = inv.date ? new Date(inv.date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
                                            const firstProduct = inv.items[0] ? products[inv.items[0].product]?.productname : 'Unknown';
                                            const more = inv.items.length > 1 ? ` +${inv.items.length - 1} more` : '';
                                            return (
                                                <div key={inv.invoiceid} className="bg-slate-50 rounded-2xl p-4 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Invoice #{inv.invoiceid}</p>
                                                            <p className="text-sm font-bold text-slate-700">{firstProduct}{more}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-black text-indigo-600">₱{Number(inv.total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${inv.is_paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                {inv.is_paid ? '✅ Paid' : '⏳ Pending'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                                        <span>📅 {date}</span>
                                                        <span className="font-bold">{inv.payment_method || 'N/A'}</span>
                                                    </div>
                                                    {/* Mini progress */}
                                                    <div className="space-y-1 pt-1">
                                                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                            <span>Placed</span><span>Processing</span><span>Shipped</span><span>Delivered</span>
                                                        </div>
                                                        <div className="h-1.5 bg-slate-200 rounded-full">
                                                            <div className="h-1.5 bg-indigo-500 rounded-full w-2/4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ══ SETTINGS TAB ══ */}
                        {activeTab === 'settings' && (
                            <motion.div key="settings"
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.15 }}
                                className="space-y-5"
                            >
                                {/* Profile Edit */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Edit Profile</h3>
                                        {!isEditing && (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                            >
                                                ✏️ Edit
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { key: 'name', label: 'Full Name', icon: '👤', type: 'text', placeholder: 'Your full name' },
                                            { key: 'email', label: 'Email Address', icon: '📧', type: 'email', placeholder: 'your@email.com' },
                                            { key: 'number', label: 'Phone Number', icon: '📞', type: 'text', placeholder: '9XXXXXXXXX' },
                                        ].map(field => (
                                            <div key={field.key} className="bg-slate-50 rounded-2xl p-4">
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                                                    {field.icon} {field.label}
                                                </label>
                                                {isEditing ? (
                                                    <div className={field.key === 'number' ? 'flex gap-2' : ''}>
                                                        {field.key === 'number' && (
                                                            <span className="flex items-center px-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-400">+63</span>
                                                        )}
                                                        <input
                                                            type={field.type}
                                                            value={editData[field.key as keyof typeof editData]}
                                                            onChange={e => setEditData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                            placeholder={field.placeholder}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
                                                        />
                                                    </div>
                                                ) : (
                                                    <p className="font-bold text-slate-800">
                                                        {field.key === 'number' && editData.number ? `+63 ${editData.number}` : editData[field.key as keyof typeof editData] || '—'}
                                                    </p>
                                                )}
                                            </div>
                                        ))}

                                        {/* Username — read-only */}
                                        <div className="bg-slate-50 rounded-2xl p-4">
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">🏷️ Username</label>
                                            <p className="font-bold text-slate-400">@{loggedInCustomer?.username}</p>
                                            <p className="text-xs text-slate-400 mt-1">Username cannot be changed.</p>
                                        </div>

                                        {isEditing && (
                                            <div className="flex gap-3 pt-1">
                                                <button
                                                    onClick={handleSaveProfile}
                                                    disabled={isSaving}
                                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-2xl transition-all"
                                                >
                                                    {isSaving ? 'Saving...' : '✓ Save Changes'}
                                                </button>
                                                <button
                                                    onClick={() => { setIsEditing(false); setSaveError(''); }}
                                                    className="px-5 py-3 bg-slate-100 text-slate-600 text-sm font-bold rounded-2xl"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}

                                        <AnimatePresence>
                                            {saveSuccess && (
                                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                    className="bg-emerald-50 text-emerald-700 text-sm font-bold rounded-2xl px-4 py-3 text-center">
                                                    ✅ Profile updated successfully!
                                                </motion.div>
                                            )}
                                            {saveError && (
                                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                    className="bg-red-50 text-red-600 text-sm font-bold rounded-2xl px-4 py-3 text-center">
                                                    ⚠️ {saveError}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Password Section */}
                                <div>
                                    <button
                                        onClick={() => setShowPasswordSection(p => !p)}
                                        className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 rounded-2xl px-4 py-3.5 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">🔑</span>
                                            <span className="text-sm font-bold text-slate-700">Change Password</span>
                                        </div>
                                        <span className="text-slate-400 text-xs font-bold">{showPasswordSection ? '▲' : '▼'}</span>
                                    </button>

                                    <AnimatePresence>
                                        {showPasswordSection && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="space-y-3 pt-3">
                                                    {[
                                                        { key: 'current', label: 'Current Password', show: showPasswords.current, toggle: () => setShowPasswords(p => ({ ...p, current: !p.current })) },
                                                        { key: 'newPass', label: 'New Password', show: showPasswords.new, toggle: () => setShowPasswords(p => ({ ...p, new: !p.new })) },
                                                        { key: 'confirm', label: 'Confirm New Password', show: showPasswords.confirm, toggle: () => setShowPasswords(p => ({ ...p, confirm: !p.confirm })) },
                                                    ].map(field => (
                                                        <div key={field.key}>
                                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{field.label}</label>
                                                            <div className="relative">
                                                                <input
                                                                    type={field.show ? 'text' : 'password'}
                                                                    value={passwordData[field.key as keyof typeof passwordData]}
                                                                    onChange={e => setPasswordData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-16 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-400 outline-none"
                                                                />
                                                                <button type="button" onClick={field.toggle}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-500 hover:text-indigo-700">
                                                                    {field.show ? 'Hide' : 'Show'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <AnimatePresence>
                                                        {passwordError && (
                                                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                                className="text-xs font-bold text-red-500 bg-red-50 rounded-xl px-3 py-2">
                                                                ⚠️ {passwordError}
                                                            </motion.p>
                                                        )}
                                                        {passwordSuccess && (
                                                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                                className="text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl px-3 py-2">
                                                                ✅ Password changed successfully!
                                                            </motion.p>
                                                        )}
                                                    </AnimatePresence>

                                                    <button
                                                        onClick={handleChangePassword}
                                                        disabled={isSaving}
                                                        className="w-full py-3 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-sm font-bold rounded-2xl transition-all"
                                                    >
                                                        {isSaving ? 'Updating...' : '🔐 Update Password'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Danger Zone */}
                                <div className="border border-red-100 rounded-2xl p-4 space-y-3">
                                    <h3 className="text-xs font-black text-red-400 uppercase tracking-widest">Danger Zone</h3>
                                    <button
                                        onClick={onLogout}
                                        className="w-full py-3 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-bold rounded-2xl transition-all"
                                    >
                                        🚪 Sign Out of Account
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;
