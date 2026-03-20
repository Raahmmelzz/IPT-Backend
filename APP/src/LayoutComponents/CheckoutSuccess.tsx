import React from 'react';
import { motion } from 'framer-motion';
import type { Product, Customer } from '../types';
import type { PaymentMethod } from '../CheckoutPage';

interface Props {
    invoiceNumber: string;
    cart: { product: Product; quantity: number }[];
    customer: Customer;
    total: number;
    subtotal: number;
    discount: number;
    tax: number;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    change: number;
    onDone: () => void;
}

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
    cash: 'Cash',
    card: 'Credit / Debit Card',
    ewallet: 'E-Wallet',
    bank: 'Bank Transfer',
};

const CheckoutSuccess: React.FC<Props> = ({
    invoiceNumber, cart, customer, total, subtotal, discount, tax,
    paymentMethod, amountPaid, change, onDone
}) => {
    const today = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-4 overflow-hidden"
            >
                {/* Success Banner */}
                <div className="bg-green-600 text-white text-center py-8 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_70%)]" />
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                        className="text-6xl mb-3"
                    >
                        ✅
                    </motion.div>
                    <h2 className="text-2xl font-black tracking-tight">Order Placed!</h2>
                    <p className="text-green-200 text-sm mt-1">Thank you, {customer.name}!</p>
                </div>

                {/* Invoice Body */}
                <div className="p-6">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-5 pb-4 border-b border-dashed border-slate-200">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-7 w-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-sm">H</div>
                                <span className="font-black text-slate-800 text-lg">Hengstore</span>
                            </div>
                            <p className="text-xs text-slate-500">Official Receipt</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-indigo-700 text-sm">{invoiceNumber}</p>
                            <p className="text-xs text-slate-500">{today} · {time}</p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-4 bg-slate-50 rounded-xl p-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</p>
                        <p className="font-black text-slate-800">{customer.name}</p>
                        <p className="text-sm text-slate-600">{customer.email}</p>
                        <p className="text-sm text-slate-600">{customer.number}</p>
                    </div>

                    {/* Item List */}
                    <div className="mb-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Items Purchased</p>
                        <div className="space-y-2">
                            {cart.map(item => (
                                <div key={item.product.productid} className="flex justify-between text-sm">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="text-slate-400 font-bold flex-shrink-0">{item.quantity}×</span>
                                        <span className="text-slate-700 font-medium truncate">{item.product.productname}</span>
                                    </div>
                                    <span className="font-bold text-slate-800 flex-shrink-0 ml-4">
                                        ₱{(Number(item.product.price) * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="border-t border-dashed border-slate-200 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Subtotal</span><span className="font-bold">₱{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount</span><span className="font-bold">−₱{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>VAT (12%)</span><span className="font-bold">₱{tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-2">
                            <span className="font-black text-slate-800 text-lg">TOTAL</span>
                            <span className="font-black text-indigo-600 text-2xl">₱{total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="mt-4 bg-slate-50 rounded-xl p-3 text-sm">
                        <div className="flex justify-between mb-1">
                            <span className="text-slate-500">Payment Method</span>
                            <span className="font-bold text-slate-800">{PAYMENT_LABEL[paymentMethod]}</span>
                        </div>
                        {paymentMethod === 'cash' && (
                            <>
                                <div className="flex justify-between mb-1">
                                    <span className="text-slate-500">Amount Paid</span>
                                    <span className="font-bold text-slate-800">₱{amountPaid.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Change</span>
                                    <span className="font-black text-green-600">₱{change.toFixed(2)}</span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between mt-1">
                            <span className="text-slate-500">Status</span>
                            <span className="font-black text-green-600">✓ Paid</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-slate-400 mt-4">Thank you for shopping at Hengstore! 🛍️</p>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                    <button
                        onClick={onDone}
                        className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        Done — Back to Store
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default CheckoutSuccess;
