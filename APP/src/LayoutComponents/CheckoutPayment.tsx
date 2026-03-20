import React, { useEffect } from 'react';
import type { PaymentMethod } from '../CheckoutPage';

interface Props {
    paymentMethod: PaymentMethod;
    setPaymentMethod: (method: PaymentMethod) => void;
    amountPaid: string;
    setAmountPaid: (val: string) => void;
    total: number;
    change: number;
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: string; desc: string }[] = [
    { value: 'cash',    label: 'Cash',          icon: '💵', desc: 'Pay with physical cash' },
    { value: 'card',    label: 'Credit / Debit', icon: '💳', desc: 'Visa, Mastercard, etc.' },
    { value: 'ewallet', label: 'E-Wallet',       icon: '📱', desc: 'GCash, Maya, etc.' },
    { value: 'bank',    label: 'Bank Transfer',  icon: '🏦', desc: 'Online banking' },
];

const CheckoutPayment: React.FC<Props> = ({
    paymentMethod, setPaymentMethod, amountPaid, setAmountPaid, total, change
}) => {

    // Automatically set amountPaid for online methods so the receipt looks correct
    useEffect(() => {
        if (paymentMethod !== 'cash') {
            setAmountPaid(total.toString());
        } else {
            setAmountPaid(''); // Reset so they have to type it for Cash
        }
    }, [paymentMethod, total, setAmountPaid]);

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
                <h3 className="text-lg font-black text-slate-800 mb-4">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {PAYMENT_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setPaymentMethod(opt.value)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                                paymentMethod === opt.value
                                    ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-100'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                            }`}
                        >
                            <div className="text-2xl mb-2">{opt.icon}</div>
                            <p className={`font-black text-sm ${paymentMethod === opt.value ? 'text-indigo-700' : 'text-slate-800'}`}>
                                {opt.label}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                        </button>
                    ))}
                </div>

                {/* Conditional UI based on method */}
                {paymentMethod === 'cash' ? (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Amount Tendered
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-500">₱</span>
                            <input
                                type="number"
                                value={amountPaid}
                                onChange={e => setAmountPaid(e.target.value)}
                                placeholder={total.toFixed(2)}
                                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-3 font-black text-slate-800 text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>

                        {Number(amountPaid) >= total && (
                            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center">
                                <span className="text-sm font-bold text-green-700">Change</span>
                                <span className="text-xl font-black text-green-700">₱{change.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center animate-in fade-in zoom-in-95">
                        <div className="text-4xl mb-3">✨</div>
                        <p className="font-black text-indigo-900">Instant Online Payment</p>
                        <p className="text-sm text-indigo-700 mt-1">
                            No manual input needed. Click <b>Place Order</b> to confirm your ₱{total.toFixed(2)} payment.
                        </p>
                    </div>
                )}
            </div>

            {/* Right side summary (keep your existing code here) */}
            <div className="lg:w-64 flex-shrink-0">
                <h3 className="text-lg font-black text-slate-800 mb-4">Final Total</h3>
                <div className="bg-indigo-900 text-white rounded-2xl p-6">
                    <p className="text-indigo-300 text-sm font-bold uppercase tracking-wider mb-1">Amount Due</p>
                    <p className="text-4xl font-black mb-6">₱{total.toFixed(2)}</p>
                    <div className="text-xs text-indigo-300 border-t border-indigo-700 pt-4">
                        Status: <span className="text-white font-bold">Awaiting Confirmation</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPayment;