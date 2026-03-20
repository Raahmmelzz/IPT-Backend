import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product, Customer } from './types';
import { invoiceAPI } from './api';

// Sub-components
import CheckoutOrderSummary from './LayoutComponents/CheckoutOrderSummary';
import CheckoutCustomerInfo from './LayoutComponents/CheckoutCustomerInfo';
import CheckoutPayment from './LayoutComponents/CheckoutPayment';
import CheckoutSuccess from './LayoutComponents/CheckoutSuccess';

interface CheckoutPageProps {
    cart: { product: Product; quantity: number }[];
    loggedInCustomer: Customer | null;
    onClose: () => void;
    onOrderComplete: (orderSummary: any) => void; 
    onOpenAuth: () => void;
}

export type PaymentMethod = 'cash' | 'card' | 'ewallet' | 'bank';

const STEPS = ['Order Summary', 'Customer Info', 'Payment'];

const CheckoutPage: React.FC<CheckoutPageProps> = ({
    cart, loggedInCustomer, onClose, onOrderComplete, onOpenAuth
}) => {
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState('');

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [amountPaid, setAmountPaid] = useState('');
    const [discount, setDiscount] = useState(0);
    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);

    const subtotal = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    const TAX_RATE = 0.12;
    const discountAmount = subtotal * (discount / 100);
    const taxable = subtotal - discountAmount;
    const tax = taxable * TAX_RATE;
    const total = taxable + tax;
    const change = Number(amountPaid) - total;

    const handlePromoCode = () => {
        if (promoCode.toLowerCase() === 'save10') {
            setDiscount(10);
            setPromoApplied(true);
        } else if (promoCode.toLowerCase() === 'save20') {
            setDiscount(20);
            setPromoApplied(true);
        } else {
            alert('Invalid promo code.');
        }
    };

    const handlePlaceOrder = async () => {
    if (!loggedInCustomer || !loggedInCustomer.customerid) return;
    setIsLoading(true);

    try {
        const invoiceData: any = {
            customer: loggedInCustomer.customerid, 
            // ROUND THESE THREE VALUES:
            totalamount: Number(total.toFixed(2)),
            amount_paid: Number(Number(amountPaid).toFixed(2)),
            change: Number(Number(change).toFixed(2)),
            
            payment_method: paymentMethod,
            is_paid: true,
            items: cart.map(item => ({
                product: item.product.productid,
                quantity: item.quantity,
                // ALSO ROUND THE UNIT PRICE JUST IN CASE:
                unitprice: Number(Number(item.product.price).toFixed(2))
            }))
        };

        // 1. Save the response from Django
        const response = await invoiceAPI.createInvoice(invoiceData);

        // 2. Grab the REAL ID from the database and update the state
        // (Assuming Django returns the ID in response.data.id)
        if (response.data && response.data.id) {
            setInvoiceNumber(`INV-${response.data.id}`);
        } else {
            // Fallback just in case
            setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`); 
        }

        // 3. Show the success screen now that we have the real ID
        setIsSuccess(true);

    } catch (err: any) {
        console.error("Django Error:", err.response?.data || err);
        alert("Failed to save order.");
    } finally {
        setIsLoading(false);
    }
};

    const canProceed = () => {
        if (step === 1 && !loggedInCustomer) return false;
        if (step === 2 && paymentMethod === 'cash') {
            if (Number(amountPaid) < total || !amountPaid) return false;
        }
        return true;
    };

    // ✅ FIXED BLOCK: Passing the correct data object back to Store.tsx via onOrderComplete
    if (isSuccess) {
        return (
            <CheckoutSuccess
                invoiceNumber={invoiceNumber}
                cart={cart}
                customer={loggedInCustomer!}
                total={total}
                subtotal={subtotal}
                discount={discountAmount}
                tax={tax}
                paymentMethod={paymentMethod}
                amountPaid={Number(amountPaid)}
                change={change}
                onDone={() => {
                    // This creates the summary object that Store.tsx's lastOrderData needs
                    onOrderComplete({
                        total: total,
                        method: paymentMethod,
                        amountPaid: Number(amountPaid),
                        change: change
                    });
                }}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden my-4"
            >
                {/* Header */}
                <div className="bg-indigo-900 text-white px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-white/20 rounded-xl flex items-center justify-center font-black text-lg">H</div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Checkout</h2>
                            <p className="text-indigo-300 text-xs font-semibold">{invoiceNumber}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-indigo-300 hover:text-white text-2xl font-bold transition-colors">&times;</button>
                </div>

                {/* Step Indicator */}
                <div className="flex border-b border-slate-100 bg-slate-50 px-8 py-4">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex items-center flex-1">
                            <button
                                onClick={() => i < step && setStep(i)}
                                className="flex items-center gap-2 group"
                            >
                                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                                    i === step ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : i < step ? 'bg-green-500 text-white'
                                    : 'bg-slate-200 text-slate-500'
                                }`}>
                                    {i < step ? '✓' : i + 1}
                                </div>
                                <span className={`text-sm font-bold transition-colors ${
                                    i === step ? 'text-indigo-700' : i < step ? 'text-green-600' : 'text-slate-400'
                                }`}>{s}</span>
                            </button>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-3 rounded-full transition-colors ${i < step ? 'bg-green-400' : 'bg-slate-200'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {step === 0 && (
                                <CheckoutOrderSummary
                                    cart={cart}
                                    subtotal={subtotal}
                                    discount={discountAmount}
                                    tax={tax}
                                    total={total}
                                    promoCode={promoCode}
                                    setPromoCode={setPromoCode}
                                    promoApplied={promoApplied}
                                    onApplyPromo={handlePromoCode}
                                    discountPercent={discount}
                                />
                            )}
                            {step === 1 && (
                                <CheckoutCustomerInfo
                                    customer={loggedInCustomer}
                                    onOpenAuth={onOpenAuth}
                                />
                            )}
                            {step === 2 && (
                                <CheckoutPayment
                                    paymentMethod={paymentMethod}
                                    setPaymentMethod={setPaymentMethod}
                                    amountPaid={amountPaid}
                                    setAmountPaid={setAmountPaid}
                                    total={total}
                                    change={change}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Navigation */}
                <div className="px-8 pb-8 flex justify-between items-center gap-4">
                    <button
                        onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
                        className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        {step === 0 ? 'Cancel' : '← Back'}
                    </button>

                    {step < STEPS.length - 1 ? (
                        <button
                            onClick={() => {
                                if (step === 1 && !loggedInCustomer) { onOpenAuth(); return; }
                                setStep(s => s + 1);
                            }}
                            disabled={!canProceed()}
                            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {step === 1 && !loggedInCustomer ? 'Login to Continue →' : 'Continue →'}
                        </button>
                    ) : (
                        <button
                            onClick={handlePlaceOrder}
                            disabled={isLoading || !canProceed()}
                            className="px-8 py-3 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> Processing...</>
                            ) : (
                                <>✓ Place Order — ₱{total.toFixed(2)}</>
                            )}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CheckoutPage;