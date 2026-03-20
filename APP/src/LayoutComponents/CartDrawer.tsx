import React from 'react';
import type { Product, Customer } from '../types';
import { motion } from 'framer-motion';

interface CartDrawerProps {
    cart: { product: Product; quantity: number }[];
    onClose: () => void;
    onRemove: (productId: number) => void;
    total: number;
    loggedInCustomer: Customer | null;
    onCheckout: () => void;
    onOpenAuth: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
    cart, onClose, onRemove, total, loggedInCustomer, onCheckout, onOpenAuth 
}) => {
    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            />
            
            <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-md bg-white h-full shadow-2xl relative z-10 flex flex-col"
            >
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-800">Your Cart ({cart.length})</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-2xl font-bold">&times;</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                        <div className="text-center text-slate-500 py-20">Your cart is empty.</div>
                    ) : (
                        cart.map(item => (
                            <div key={item.product.productid} className="flex gap-4 items-center bg-slate-50 p-3 rounded-xl">
                                <img 
    src={item.product.image || ""} 
    alt={item.product.productname} 
    className="h-16 w-16 rounded-lg object-cover" 
/>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{item.product.productname}</h4>
                                    <p className="text-indigo-600 font-bold">${item.product.price}</p>
                                </div>
                                <div className="text-center px-2">
                                    <p className="text-xs text-slate-500 font-bold mb-1">Qty</p>
                                    <p className="font-bold">{item.quantity}</p>
                                </div>
                                <button onClick={() => onRemove(item.product.productid!)} className="text-red-400 hover:text-red-600 p-2">🗑️</button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-bold text-slate-600">Total</span>
                        <span className="text-3xl font-black text-indigo-600">${total.toFixed(2)}</span>
                    </div>
                    {loggedInCustomer ? (
                        <div className="space-y-2">
                            <p className="text-sm text-slate-500 text-center mb-2">Checking out as: <strong className="text-slate-800">{loggedInCustomer.name}</strong></p>
                            <button onClick={onCheckout} disabled={cart.length === 0} className="w-full bg-indigo-600 text-white font-black text-lg py-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">Place Order</button>
                        </div>
                    ) : (
                        <button onClick={() => { onClose(); onOpenAuth(); }} className="w-full bg-slate-800 text-white font-black text-lg py-4 rounded-xl hover:bg-slate-700 transition-colors">Login to Checkout</button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CartDrawer;