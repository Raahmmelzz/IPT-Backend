import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ManageOrders from './ManageOrders';
import ManageProducts from './ManageProducts';
import ManageCustomers from './ManageCustomers';

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'customers'>('orders');
    
    // 1. Create state to hold the data the components need
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);

    // 2. Create a refresh function to fetch data from your Django backend
    const refreshData = async () => {
        try {
            const prodRes = await axios.get('http://localhost:8000/api/products/');
            const custRes = await axios.get('http://localhost:8000/api/customers/');
            setProducts(prodRes.data);
            setCustomers(custRes.data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        }
    };

    // 3. Fetch on load
    useEffect(() => {
        refreshData();
    }, []);

    return (
        <div className="flex min-h-screen bg-slate-100">
            {/* --- SIDEBAR (Same as before) --- */}
            <div className="w-64 bg-slate-900 text-white p-6 flex flex-col fixed h-full">
                <h2 className="text-2xl font-black text-indigo-400 mb-10">ADMIN PANEL</h2>
                <nav className="flex flex-col gap-3">
                    <button onClick={() => setActiveTab('orders')} className={`p-4 rounded-xl ${activeTab === 'orders' ? 'bg-indigo-600' : 'text-slate-400'}`}>📦 Orders</button>
                    <button onClick={() => setActiveTab('products')} className={`p-4 rounded-xl ${activeTab === 'products' ? 'bg-indigo-600' : 'text-slate-400'}`}>🛍️ Products</button>
                    <button onClick={() => setActiveTab('customers')} className={`p-4 rounded-xl ${activeTab === 'customers' ? 'bg-indigo-600' : 'text-slate-400'}`}>👥 Customers</button>
                </nav>
            </div>

            {/* --- MAIN CONTENT --- */}
            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 ml-64 p-8">
                
                {/* Needs no props, fetches its own data */}
                {activeTab === 'orders' && <ManageOrders />}
                
                {/* Needs props passed down from Dashboard */}
                {activeTab === 'products' && (
                    <ManageProducts 
                        products={products} 
                        refresh={refreshData} 
                    />
                )}
                
                {/* Needs no props, fetches its own data */}
                {activeTab === 'customers' && <ManageCustomers />}
                
            </div>
        </div>
    );
};

export default Dashboard;