import React from 'react';
import type { Customer } from '../types';

interface Props {
    customer: Customer | null;
    onOpenAuth: () => void;
}

const CheckoutCustomerInfo: React.FC<Props> = ({ customer, onOpenAuth }) => {
    if (!customer) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-6xl mb-4">🔐</div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Login Required</h3>
                <p className="text-slate-500 mb-8 max-w-xs">
                    You need to be logged in to place an order. Please login or create an account.
                </p>
                <button
                    onClick={onOpenAuth}
                    className="px-8 py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    Login / Sign Up
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Customer Details Card */}
            <div className="flex-1">
                <h3 className="text-lg font-black text-slate-800 mb-4">Customer Details</h3>
                
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    {/* Avatar / Name Row */}
                    <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-200">
                        <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-200">
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-800">{customer.name}</p>
                            <p className="text-sm text-indigo-600 font-bold">@{customer.username}</p>
                        </div>
                        <div className="ml-auto">
                            <span className="bg-green-100 text-green-700 text-xs font-black px-3 py-1 rounded-full">Verified ✓</span>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoField label="Full Name" value={customer.name} icon="👤" />
                        <InfoField label="Username" value={`@${customer.username}`} icon="🏷️" />
                        <InfoField label="Email" value={customer.email} icon="✉️" />
                        <InfoField label="Phone" value={customer.number} icon="📞" />
                    </div>
                </div>
            </div>

            {/* Delivery Notes */}
            <div className="lg:w-64 flex-shrink-0">
                <h3 className="text-lg font-black text-slate-800 mb-4">Order Notes</h3>
                <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-1">Note</p>
                        <p className="text-sm text-amber-800">This order will be linked to your account and viewable in your order history.</p>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                        <p className="text-xs font-black text-indigo-700 uppercase tracking-wider mb-1">Customer ID</p>
                        <p className="text-sm font-black text-indigo-800">#{customer.customerid}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoField: React.FC<{ label: string; value: string; icon: string }> = ({ label, value, icon }) => (
    <div className="bg-white rounded-xl p-3 border border-slate-100">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{icon} {label}</p>
        <p className="font-bold text-slate-800 truncate">{value || '—'}</p>
    </div>
);

export default CheckoutCustomerInfo;
