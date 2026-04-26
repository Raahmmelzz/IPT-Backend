import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Customer, Invoice, Product } from './types';
import { customerAPI, invoiceAPI, productAPI } from './api';

interface ProfilePageProps {
    loggedInCustomer: Customer | null;
    onLogout: () => void;
    onCustomerUpdate: (updated: Customer) => void;
}

type Tab = 'overview' | 'orders' | 'settings';

const ProfilePage: React.FC<ProfilePageProps> = ({
    loggedInCustomer,
    onLogout,
    onCustomerUpdate,
}) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [products, setProducts] = useState<Record<number, Product>>({});
    const [loadingOrders, setLoadingOrders] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: loggedInCustomer?.name || '',
        email: loggedInCustomer?.email || '',
        number: loggedInCustomer?.number || '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (loggedInCustomer) {
            setEditData({
                name: loggedInCustomer.name,
                email: loggedInCustomer.email,
                number: loggedInCustomer.number,
            });
        } else { navigate('/'); }
    }, [loggedInCustomer, navigate]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!loggedInCustomer) return;
            setLoadingOrders(true);
            try {
                const [invRes, prodRes] = await Promise.all([
                    invoiceAPI.getInvoices(),
                    productAPI.getProducts(),
                ]);
                const myInvoices = invRes.data.filter((inv: Invoice) => Number(inv.customer) === Number(loggedInCustomer.customerid));
                const productMap: Record<number, Product> = {};
                prodRes.data.forEach((p: Product) => { if (p.productid != null) productMap[p.productid] = p; });
                setInvoices(myInvoices);
                setProducts(productMap);
            } catch (e) { console.error(e); } finally { setLoadingOrders(false); }
        };
        fetchOrders();
    }, [loggedInCustomer]);

    const totalSpent = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const avatarColor = ['from-indigo-500 to-purple-600', 'from-emerald-500 to-teal-600', 'from-orange-500 to-rose-600'][(loggedInCustomer?.customerid || 0) % 3];

    const handleSaveProfile = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!loggedInCustomer?.customerid || isSaving) return;
        setIsSaving(true);
        try {
            const res = await customerAPI.updateCustomer(loggedInCustomer.customerid, editData);
            onCustomerUpdate(res.data);
            setSaveSuccess(true);
            setIsEditing(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) { alert("Save failed."); } finally { setIsSaving(false); }
    };

    return (
        <div className="min-h-screen w-full bg-slate-900 font-sans overflow-x-hidden flex flex-col">
            <div className="w-full bg-slate-900/50 backdrop-blur-xl border-b border-white/5 py-6 px-12 flex justify-between items-center text-white sticky top-0 z-50">
                <button onClick={() => navigate('/')} className="font-black text-white/60 hover:text-indigo-400 transition-all flex items-center gap-3 group text-lg">
                    <span className="text-2xl group-hover:-translate-x-2 transition-transform">←</span> BACK TO STORE
                </button>
                <div className="flex items-center gap-4">
                    <h1 className="font-black text-2xl tracking-[0.3em] uppercase italic opacity-40">Profile Dashboard</h1>
                    <div className="h-8 w-[2px] bg-white/10 mx-2" />
                    <button onClick={onLogout} className="text-red-400 font-black text-xs uppercase tracking-widest hover:text-red-300">Sign Out</button>
                </div>
            </div>

            <main className="flex-1 w-full flex flex-col">
                <div className="relative h-80 w-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 overflow-hidden">
                    <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent" />
                </div>

                <div className="max-w-[1600px] w-full mx-auto px-12 -mt-32 relative z-10">
                    <div className="flex items-end gap-10 mb-12">
                        <div className={`w-56 h-56 rounded-[50px] bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-8xl font-black shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-[16px] border-slate-900`}>
                            {loggedInCustomer ? getInitials(loggedInCustomer.name) : '?'}
                        </div>
                        <div className="pb-8 flex-1">
                            <h2 className="text-6xl font-black text-white tracking-tighter leading-none mb-4">{loggedInCustomer?.name}</h2>
                            <div className="flex gap-4 items-center">
                                <span className="bg-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full font-black text-sm tracking-widest uppercase border border-indigo-500/30">Verified Member</span>
                                <span className="text-white/40 font-bold text-xl">@{loggedInCustomer?.username}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-8 mb-16">
                        <div className="col-span-4 space-y-8">
                            <div className="bg-slate-800/40 border border-white/5 p-3 rounded-[40px] flex flex-col gap-2">
                                {(['overview', 'orders', 'settings'] as Tab[]).map((t) => (
                                    <button key={t} onClick={() => setActiveTab(t)} 
                                        className={`w-full py-6 rounded-[32px] text-sm font-black transition-all uppercase tracking-[0.2em] flex items-center justify-between px-10 ${
                                            activeTab === t ? 'bg-indigo-600 text-white shadow-2xl scale-[1.02]' : 'text-white/40 hover:text-white hover:bg-white/5'
                                        }`}>
                                        {t} {activeTab === t && <span>→</span>}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-slate-800/40 border border-white/5 rounded-[35px] p-8 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Orders</p>
                                        <p className="text-3xl font-black text-indigo-400">{invoices.length}</p>
                                    </div>
                                    <span className="text-4xl opacity-20">📦</span>
                                </div>
                                <div className="bg-slate-800/40 border border-white/5 rounded-[35px] p-8 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Spent</p>
                                        <p className="text-3xl font-black text-purple-400">₱{totalSpent.toLocaleString()}</p>
                                    </div>
                                    <span className="text-4xl opacity-20">💳</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-8 bg-slate-800/20 border border-white/5 rounded-[50px] p-12 min-h-[600px] backdrop-blur-sm relative overflow-hidden">
                            <AnimatePresence mode="wait">
                                {activeTab === 'overview' && (
                                    <motion.div key="overview" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-12">
                                        <div className="grid grid-cols-2 gap-8">
                                            <DetailCard label="Registered Email" value={loggedInCustomer?.email} icon="📧" />
                                            <DetailCard label="Contact Number" value={`+63 ${loggedInCustomer?.number}`} icon="📞" />
                                            <DetailCard label="Active Orders" value={invoices.length} icon="🚚" />
                                            <DetailCard label="Account Status" value="Gold Member" icon="👑" />
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'orders' && (
                                    <motion.div key="orders" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8">Purchase History</h3>
                                        {loadingOrders ? (
                                            <p className="text-white/20 animate-pulse font-bold">Loading...</p>
                                        ) : invoices.length === 0 ? (
                                            <p className="text-white/30">No orders found.</p>
                                        ) : (
                                            <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                                {invoices.map(inv => (
                                                    <div key={inv.invoiceid} className="bg-slate-900/60 p-8 rounded-[35px] border border-white/5 flex justify-between items-center group">
                                                        <div>
                                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Invoice #{inv.invoiceid}</p>
                                                            <p className="text-3xl font-black text-white">₱{Number(inv.total).toLocaleString()}</p>
                                                            <p className="text-xs text-white/40 mt-1">{new Date(inv.date!).toLocaleDateString()}</p>
                                                        </div>
                                                        <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${inv.is_paid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                            {inv.is_paid ? 'SUCCESS' : 'PENDING'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'settings' && (
                                    <motion.div key="settings" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-2xl">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-6">
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Edit Credentials</h3>
                                            {!isEditing && <button onClick={() => setIsEditing(true)} className="bg-white text-slate-900 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Edit Mode</button>}
                                        </div>
                                        <div className="space-y-8">
                                            {['name', 'email', 'number'].map((key) => (
                                                <div key={key}>
                                                    <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] block mb-4">{key}</label>
                                                    {isEditing ? (
                                                        <input className="w-full bg-slate-900/50 border border-white/10 rounded-[25px] px-8 py-6 font-black text-white text-xl focus:border-indigo-500 outline-none transition-all"
                                                            value={editData[key as keyof typeof editData]}
                                                            onChange={e => setEditData(p => ({...p, [key]: e.target.value}))} />
                                                    ) : (
                                                        <p className="font-black text-white text-3xl opacity-90">{editData[key as keyof typeof editData] || '—'}</p>
                                                    )}
                                                </div>
                                            ))}
                                            {isEditing && (
                                                <div className="flex gap-4 pt-10">
                                                    <button onClick={handleSaveProfile} disabled={isSaving} className="flex-1 bg-indigo-600 text-white py-6 rounded-[30px] font-black text-sm uppercase tracking-[0.3em] hover:bg-indigo-500 active:scale-95 transition-all">
                                                        {isSaving ? 'Processing...' : 'Apply Changes'}
                                                    </button>
                                                    <button onClick={() => setIsEditing(false)} className="px-12 bg-slate-800 text-white/50 py-6 rounded-[30px] font-black text-sm uppercase">Cancel</button>
                                                </div>
                                            )}
                                            {saveSuccess && <p className="text-emerald-400 font-black text-sm uppercase tracking-widest mt-6 animate-pulse">✓ Changes Synced Successfully</p>}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const DetailCard = ({ label, value, icon }: any) => (
    <div className="bg-slate-900/40 p-6 md:p-10 rounded-[40px] border border-white/5 flex items-center gap-6 md:gap-8 group hover:bg-slate-900/60 transition-all min-w-0">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-[25px] bg-slate-800 flex-shrink-0 flex items-center justify-center text-2xl md:text-3xl shadow-inner group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2 truncate">{label}</p>
            <p className="text-lg md:text-2xl font-black text-white group-hover:text-indigo-400 transition-colors break-all leading-tight">
                {value || '—'}
            </p>
        </div>
    </div>
);

export default ProfilePage;