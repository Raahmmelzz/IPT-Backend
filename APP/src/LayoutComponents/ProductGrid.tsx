// src/LayoutComponents/ProductGrid.tsx
import React from 'react';
import type { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    products: Product[];
    searchQuery: string;
    
    onSearchChange: (val: string) => void;
    onAddToCart: (p: Product, e: React.MouseEvent) => void;
}

const ProductGrid: React.FC<Props> = ({ products, searchQuery, onSearchChange, onAddToCart }) => {
    return (
        <main className="w-full py-16">
            {/* Search Bar section (make sure your actual search bar has dark mode classes too if it's in here!) */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                <AnimatePresence>
                    {products.map((p, index) => (
                        <motion.div 
                            key={p.productid}
                            layout 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            // 🎮 NEW DARK MODE CARD STYLES
                            className="w-full bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] hover:border-indigo-500/50 transition-all duration-300 group flex flex-col"
                        >
                            {/* 🎮 Darker image container */}
                            <div className="h-48 w-full bg-slate-950 overflow-hidden relative">
                                <img 
                                    src={p.image ? p.image : `https://picsum.photos/seed/${p.productid}/400/300`} 
                                    alt={p.productname} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                                {/* Subtle dark overlay on images that disappears on hover */}
                                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors duration-300"></div>
                            </div>
                            
                            <div className="p-5 flex flex-col flex-grow">
                                {/* 🎮 White text for product name */}
                                <h3 className="text-lg font-bold text-white mb-1 drop-shadow-md">{p.productname}</h3>
                                {/* 🎮 Brighter indigo for the price so it pops in the dark */}
                                <p className="text-2xl font-black text-indigo-400 mt-auto mb-4 drop-shadow-sm">₱{p.price}</p>
                                
                                {/* 🎮 DARK GAMER BUTTON */}
                                <button 
                                    onClick={(e) => onAddToCart(p, e)} 
                                    className="w-full py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-bold hover:bg-indigo-600 hover:border-indigo-500 hover:text-white hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all duration-300"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </main>
    );
};

export default ProductGrid;