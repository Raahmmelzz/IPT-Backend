import React, { useState } from 'react';
import { productAPI } from './api';

interface AddProductProps {
    onSuccess: () => void;
}

const AddProduct: React.FC<AddProductProps> = ({ onSuccess }) => {
    // 1. We split the state up and added 'image'
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 2. We use FormData here to send the file securely!
        const formData = new FormData();
        formData.append('productname', name);
        formData.append('price', price);
        if (image) {
            formData.append('image', image);
        }

        try {
            await productAPI.addProduct(formData); 
            // 3. Clear the form
            setName('');
            setPrice('');
            setImage(null);
            onSuccess();
            alert("Product added successfully!");
        } catch (err) {
            console.error("Error adding product:", err);
            alert("Failed to add product.");
        }
    };

    return (
        <div className="mb-8 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Add New Product</h3>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <input 
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none"
                    placeholder="Product Name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                />
                <input 
                    className="w-full sm:w-32 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none"
                    type="number" 
                    step="0.01"
                    placeholder="Price" 
                    value={price} 
                    onChange={e => setPrice(e.target.value)} 
                    required 
                />
                
                {/* 4. This is the new file upload button! */}
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setImage(e.target.files ? e.target.files[0] : null)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-white"
                />

                <button type="submit" className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors">
                    Create
                </button>
            </form>
        </div>
    );
};

export default AddProduct;