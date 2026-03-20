import React, { useState } from 'react';

interface PaymentTabProps {
  subtotal: number;
  onPaymentSuccess: (method: string) => void;
}

export const PaymentTab: React.FC<PaymentTabProps> = ({ subtotal, onPaymentSuccess }) => {
  const [method, setMethod] = useState('GCash');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const vat = subtotal * 0.12;
  const total = subtotal + vat;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess(method); 
    }, 1000);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4 text-slate-800">Payment Details</h2>
      
      <div className="mb-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
        <div className="flex justify-between text-slate-600 mb-2 font-medium">
          <span>Subtotal:</span>
          <span>₱{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600 mb-3 font-medium">
          <span>VAT (12%):</span>
          <span>₱{vat.toFixed(2)}</span>
        </div>
        <div className="border-t border-slate-200 my-2"></div>
        <div className="flex justify-between font-black text-xl text-slate-800 mt-2">
          <span>Total to Pay:</span>
          <span className="text-indigo-600">₱{total.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handlePayment}>
        <label className="block mb-2 font-bold text-slate-700">Select Payment Method</label>
        <select 
          value={method} 
          onChange={(e) => setMethod(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-xl mb-6 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
        >
          {/* Removed Cash on Delivery */}
          <option value="GCash">GCash</option>
          <option value="Maya">Maya</option>
        </select>

        <button 
          type="submit" 
          disabled={isProcessing}
          className={`w-full font-black text-lg py-4 rounded-xl transition-colors ${
            isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isProcessing ? 'Processing Payment...' : `Confirm Payment of ₱${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};