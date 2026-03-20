import React from 'react';
import type { Product } from '../types';

interface Props {
    cart: { product: Product; quantity: number }[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    promoCode: string;
    setPromoCode: (val: string) => void;
    promoApplied: boolean;
    onApplyPromo: () => void;
    discountPercent: number;
}

const CheckoutOrderSummary: React.FC<Props> = ({
    cart, subtotal, discount, tax, total,
    promoCode, setPromoCode, promoApplied, onApplyPromo, discountPercent
}) => {
    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Item List */}
            <div className="flex-1">
                <h3 className="text-lg font-black text-slate-800 mb-4">
                    Order Items <span className="text-slate-400 font-normal text-sm">({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
                </h3>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {cart.map(item => (
                        <div key={item.product.productid} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                            <img
                                src={`https://picsum.photos/seed/${item.product.productid}/80/80`}
                                alt={item.product.productname}
                                className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 truncate">{item.product.productname}</p>
                                <p className="text-sm text-slate-500">
                                    ₱{Number(item.product.price).toFixed(2)} × {item.quantity}
                                </p>
                            </div>
                            <p className="font-black text-indigo-600 text-right flex-shrink-0">
                                ₱{(Number(item.product.price) * item.quantity).toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Promo Code */}
                <div className="mt-5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Promo Code</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={promoCode}
                            onChange={e => setPromoCode(e.target.value.toUpperCase())}
                            disabled={promoApplied}
                            placeholder="e.g. SAVE10"
                            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                        />
                        <button
                            onClick={onApplyPromo}
                            disabled={promoApplied || !promoCode}
                            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {promoApplied ? '✓ Applied' : 'Apply'}
                        </button>
                    </div>
                    {promoApplied && (
                        <p className="text-green-600 text-xs font-bold mt-1.5">🎉 {discountPercent}% discount applied!</p>
                    )}
                </div>
            </div>

            {/* Right: Price Breakdown */}
            <div className="lg:w-64 flex-shrink-0">
                <div className="bg-slate-50 rounded-2xl p-6 sticky top-0">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4">Price Breakdown</h3>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600 font-medium">Subtotal</span>
                            <span className="font-bold text-slate-800">₱{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600 font-medium">Discount ({discountPercent}%)</span>
                                <span className="font-bold text-green-600">−₱{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600 font-medium">VAT (12%)</span>
                            <span className="font-bold text-slate-800">₱{tax.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                            <span className="font-black text-slate-800">Total</span>
                            <span className="text-2xl font-black text-indigo-600">₱{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutOrderSummary;
