import React from 'react';
import ManageProducts from '../ManageProducts';
import ManageCustomers from '../ManageCustomers';
import ManageOrders from '../ManageOrders'; // We keep this import to avoid file renaming errors
import type { Product } from '../types';

interface AdminPanelProps {
    adminTab: 'products' | 'customers' | 'invoices'; // Swapped 'orders' for 'invoices'
    setAdminTab: (tab: 'products' | 'customers' | 'invoices') => void;
    products: Product[];
    loadProducts: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ adminTab, setAdminTab, products, loadProducts }) => {
    return (
        <div className="w-full mt-8 animate-fade-in">
            {/* Tab Switcher */}
            <div className="w-full flex justify-center gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-slate-100 inline-flex mx-auto">
                {['products', 'customers', 'invoices'].map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setAdminTab(tab as any)} 
                        className={`px-6 py-2.5 rounded-lg font-bold capitalize transition-colors ${adminTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="w-full">
                {adminTab === 'products' && <ManageProducts products={products} refresh={loadProducts} />}
                {adminTab === 'customers' && <ManageCustomers />}
                
                {/* This will render your new Invoice table when the 'Invoices' tab is clicked! */}
                {adminTab === 'invoices' && <ManageOrders />} 
            </div>
        </div>
    );
};

export default AdminPanel;