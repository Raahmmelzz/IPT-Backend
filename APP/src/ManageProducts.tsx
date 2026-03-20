import React, { useState } from 'react';
import type { Product } from './types';
import { productAPI } from './api';
import AddProduct from './AddProduct';

interface Props {
    products: Product[];
    refresh: () => void;
}

const ManageProducts: React.FC<Props> = ({ products, refresh }) => {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ productname: '', price: '' });
    
    // 1. Add state to hold the new image when editing
    const [editImage, setEditImage] = useState<File | null>(null);

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure?")) {
            await productAPI.deleteProduct(id);
            refresh();
        }
    };

    const handleSave = async (id: number) => {
        // 2. Use FormData to send the update securely!
        const formData = new FormData();
        formData.append('productname', editForm.productname);
        formData.append('price', editForm.price);
        
        // Only append the image if you actually selected a NEW picture!
        if (editImage) {
            formData.append('image', editImage);
        }

        try {
            await productAPI.updateProduct(id, formData);
            setEditingId(null);
            setEditImage(null); // Clear the image state
            refresh();
        } catch (err) {
            console.error("Error updating product:", err);
            alert("Failed to update product.");
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
            <AddProduct onSuccess={refresh} />

            <h3 className="text-xl font-bold mb-6 text-slate-800">Current Inventory</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 font-bold">ID</th>
                            <th className="py-3 px-6 font-bold text-center">Image</th>
                            <th className="py-3 px-6 font-bold">Name</th>
                            <th className="py-3 px-6 font-bold">Price</th>
                            <th className="py-3 px-6 font-bold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700 text-sm font-light">
                        {products.map(p => (
                            <tr key={p.productid} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-6 font-medium">{p.productid}</td>
                                
                                {/* Display the thumbnail in the table */}
                                <td className="py-4 px-6 flex justify-center">
                                    <img 
                                        src={p.image || `https://picsum.photos/seed/${p.productid}/50/50`} 
                                        alt={p.productname} 
                                        className="w-12 h-12 object-cover rounded-md shadow-sm border border-slate-200"
                                    />
                                </td>

                                <td className="py-4 px-6">
                                    {editingId === p.productid ? (
                                        <input 
                                            className="px-2 py-1 border rounded w-full"
                                            value={editForm.productname} 
                                            onChange={e => setEditForm({...editForm, productname: e.target.value})} 
                                        />
                                    ) : p.productname}
                                </td>
                                <td className="py-4 px-6">
                                    {editingId === p.productid ? (
                                        <div className="flex flex-col gap-2">
                                            <input 
                                                className="px-2 py-1 border rounded w-32"
                                                type="number"
                                                step="0.01"
                                                value={editForm.price} 
                                                onChange={e => setEditForm({...editForm, price: e.target.value})} 
                                            />
                                            {/* 3. The new file input for replacing the image */}
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={e => setEditImage(e.target.files ? e.target.files[0] : null)}
                                                className="text-xs w-48"
                                            />
                                        </div>
                                    ) : `₱${p.price}`}
                                </td>
                                <td className="py-4 px-6 text-center">
                                    {editingId === p.productid ? (
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleSave(p.productid!)} className="bg-green-500 text-white px-3 py-1 rounded-lg font-bold">Save</button>
                                            <button onClick={() => { setEditingId(null); setEditImage(null); }} className="bg-slate-400 text-white px-3 py-1 rounded-lg font-bold">Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => {
                                                setEditingId(p.productid!);
                                                setEditForm({ productname: p.productname, price: String(p.price) });
                                                setEditImage(null); // Clear any old file selection
                                            }} className="bg-blue-500 text-white px-4 py-1 rounded-lg font-bold hover:bg-blue-600">Edit</button>
                                            <button onClick={() => handleDelete(p.productid!)} className="bg-red-500 text-white px-4 py-1 rounded-lg font-bold hover:bg-red-600">Delete</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageProducts;