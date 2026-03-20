import React from 'react';
import type { Customer } from '../types';

interface Props {
    loggedInCustomer: Customer | null;
}

const Hero: React.FC<Props> = ({ loggedInCustomer }) => {
    return (
        <header 
            className="w-full text-center py-24 mt-4 rounded-[2rem] text-white shadow-2xl relative overflow-hidden bg-cover bg-center"
            style={{ 
                // 🎮 Replace this URL with your favorite picture of pro players!
                backgroundImage: `url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')` 
            }}
        >
            {/* Dark purple overlay so your text remains readable over the photo */}
            <div className="absolute inset-0 bg-indigo-950/70"></div>
            
            {/* Your original glowing effect */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            
            {/* We wrap the text in a relative div so it sits ON TOP of the image and overlays */}
            <div className="relative z-10 px-4">
                <h2 className="text-5xl font-black mb-4 drop-shadow-2xl">
                    The One-Stop G-stop shop for gamers, by gamers.
                </h2>
                <p className="text-xl text-indigo-100 drop-shadow-lg font-medium">
                    {loggedInCustomer ? `Welcome back, ${loggedInCustomer.name}!` : "Explore our latest arrivals below."}
                </p>
            </div>
        </header>
    );
};

export default Hero;