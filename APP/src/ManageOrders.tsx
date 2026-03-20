import React, { useState, useEffect } from 'react';
import type { Invoice, Customer, Product } from './types';
import { invoiceAPI, customerAPI, productAPI } from './api';
import { Invoice as InvoiceComponent } from './LayoutComponents/Invoice'; 

const ManageOrders: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

    const loadData = async () => {
        try {
            const [invoicesRes, customersRes, productsRes] = await Promise.all([
                invoiceAPI.getInvoices(),
                customerAPI.getCustomers(),
                productAPI.getProducts()
            ]);
            setInvoices(invoicesRes.data);
            setCustomers(customersRes.data);
            setProducts(productsRes.data);
        } catch (err) { console.error("Error loading data:", err); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const getCustomerName = (id: number) => {
        const customer = customers.find(c => c.customerid === id);
        return customer ? customer.name : `Unknown ID: ${id}`;
    };

    const getProduct = (id: number) => products.find(p => p.productid === id);

    const handleDeleteInvoice = async (id: number) => {
        if (confirm(`Are you sure you want to delete Invoice #${id}?`)) {
            try {
                await invoiceAPI.deleteInvoice(id);
                loadData(); 
            } catch (err) { alert("Failed to delete the invoice."); }
        }
    };

    if (isLoading) return <div className="text-center py-10 text-slate-500 font-bold">Loading order data...</div>;

    // RENDER INVOICE MODAL
    if (viewingInvoice) {
        // Map backend InvoiceItems to the format the UI InvoiceComponent expects
        const uiInvoiceItems = viewingInvoice.items.map(item => {
            const product = getProduct(item.product);
            return {
                name: product?.productname || "Unknown Item",
                quantity: item.quantity,
                price: Number(item.price_at_purchase)
            };
        });

        return (
            <div className="fixed inset-0 z-[70] bg-slate-50 flex justify-center items-start pt-10 p-4 overflow-y-auto">
                <div className="w-full max-w-2xl relative">
                    <InvoiceComponent 
                        items={uiInvoiceItems}
                        customerName={getCustomerName(viewingInvoice.customer)}
                        subtotal={Number(viewingInvoice.subtotal)}
                        invoiceNumber={viewingInvoice.invoiceid}
                        amountPaid={Number(viewingInvoice.amount_paid)}
                        change={Number(viewingInvoice.change)}
                        paymentMethod={viewingInvoice.payment_method}
                        onReset={() => setViewingInvoice(null)}
                    />
                </div>
            </div>
        );
    }

    // RENDER MAIN ADMIN TABLE
    return (
        <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-8">
            <h3 className="text-xl font-bold mb-6 text-slate-800">Order History</h3>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 font-bold">Invoice #</th>
                            <th className="py-3 px-6 font-bold">Customer</th>
                            <th className="py-3 px-6 font-bold">Items Summary</th>
                            <th className="py-3 px-6 font-bold text-center">Total Qty</th>
                            <th className="py-3 px-6 font-bold">Total Price</th>
                            {/* --- NEW COLUMNS ADDED HERE --- */}
                            <th className="py-3 px-6 font-bold text-green-600">Paid</th>
                            <th className="py-3 px-6 font-bold text-indigo-600">Change</th>
                            {/* ------------------------------ */}
                            <th className="py-3 px-6 font-bold text-center">Status</th>
                            <th className="py-3 px-6 font-bold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700 text-sm font-light">
                        {invoices.map((inv) => {
                            const totalQty = inv.items.reduce((sum, item) => sum + item.quantity, 0);
                            
                            // Get the first item's name for the summary column
                            const firstProduct = inv.items.length > 0 ? getProduct(inv.items[0].product) : null;
                            const firstProductName = firstProduct?.productname || "Unknown Item";
                            const productDisplay = inv.items.length > 1 ? `${firstProductName} (+${inv.items.length - 1} items)` : firstProductName;

                            return (
                                <tr key={inv.invoiceid} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6 font-semibold">#{inv.invoiceid}</td>
                                    <td className="py-4 px-6 font-semibold">{getCustomerName(inv.customer)}</td>
                                    <td className="py-4 px-6 text-slate-600 font-medium">{productDisplay}</td>
                                    <td className="py-4 px-6 text-center font-bold bg-slate-50/50">{totalQty}</td>
                                    <td className="py-4 px-6 font-black text-indigo-600">₱{Number(inv.total).toFixed(2)}</td>
                                    
                                    {/* --- NEW DATA CELLS ADDED HERE --- */}
                                    <td className="py-4 px-6 font-bold text-green-600">₱{Number(inv.amount_paid).toFixed(2)}</td>
                                    <td className="py-4 px-6 font-bold text-indigo-600">₱{Number(inv.change).toFixed(2)}</td>
                                    {/* --------------------------------- */}
                                    
                                    <td className="py-4 px-6 text-center">
                                        {inv.is_paid ? (
                                            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">PAID</span>
                                        ) : (
                                            <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full border border-amber-200">PENDING</span>
                                        )}
                                    </td>

                                    <td className="py-4 px-6 text-center space-x-2 whitespace-nowrap">
                                        <button 
                                            onClick={() => setViewingInvoice(inv)}
                                            className="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-900 transition-colors text-xs shadow-sm"
                                        >
                                            View Invoice
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteInvoice(inv.invoiceid!)} 
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors font-bold text-xs border border-transparent hover:border-red-100"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {invoices.length === 0 && <div className="w-full text-center py-12 text-slate-400 font-medium">No orders have been placed yet.</div>}
            </div>
        </div>
    );
};

export default ManageOrders;