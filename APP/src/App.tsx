import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Store from './Store';
import ProfilePage from './ProfilePage';
import Dashboard from './Dashboard';
import type { Customer } from './types';

function App() {
    const [loggedInCustomer, setLoggedInCustomer] = useState<Customer | null>(null);

    // This function ensures that when Profile saves, App.tsx (and the Shop) knows about it
    const handleCustomerUpdate = (updated: Customer) => {
        setLoggedInCustomer(updated);
    };

    return (
        <BrowserRouter>
            <div className="App">
                <Routes>
                    <Route 
                        path="/" 
                        element={
                            <Store 
                                loggedInCustomer={loggedInCustomer} 
                                setLoggedInCustomer={setLoggedInCustomer} 
                            />
                        } 
                    />
                    
                    <Route 
                        path="/profile" 
                        element={
                            <ProfilePage 
                                loggedInCustomer={loggedInCustomer} 
                                onLogout={() => setLoggedInCustomer(null)}
                                onCustomerUpdate={handleCustomerUpdate} 
                            />
                        } 
                    />

                    <Route path="/admin" element={<Dashboard />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;