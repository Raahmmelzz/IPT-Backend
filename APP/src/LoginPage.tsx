import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginPageProps {
    authMode: 'login' | 'signup';
    setAuthMode: (mode: 'login' | 'signup') => void;
    isLoading: boolean;
    loginUsername: string;
    setLoginUsername: (val: string) => void;
    loginPassword: string;
    setLoginPassword: (val: string) => void;
    handleLogin: () => void;
    signupData: any;
    setSignupData: (data: any) => void;
    handleSignup: () => void;
}

// Password strength logic
const strengthConfig = {
    weak:   { label: 'Weak',   color: 'bg-red-500',    text: 'text-red-400' },
    fair:   { label: 'Fair',   color: 'bg-orange-400', text: 'text-orange-400' },
    good:   { label: 'Good',   color: 'bg-yellow-400', text: 'text-yellow-400' },
    strong: { label: 'Strong', color: 'bg-emerald-500',text: 'text-emerald-400' },
};

const getPasswordStrength = (password: string) => {
    const checks = {
        length:    password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number:    /[0-9]/.test(password),
        special:   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    const passed = Object.values(checks).filter(Boolean).length;
    const level: keyof typeof strengthConfig = passed <= 1 ? 'weak' : passed <= 3 ? 'fair' : passed === 4 ? 'good' : 'strong';
    return { checks, passed, level };
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const blank6 = (): string[] => ['', '', '', '', '', ''];

const OtpInput: React.FC<{ otp: string[]; onChange: (otp: string[]) => void }> = ({ otp, onChange }) => {
    const refs = useRef<(HTMLInputElement | null)[]>([]);
    const handleChange = (i: number, val: string) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...otp]; next[i] = val; onChange(next);
        if (val && i < 5) refs.current[i + 1]?.focus();
    };
    const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
    };
    return (
        <div className="flex gap-2 justify-center">
            {otp.map((digit, i) => (
                <input key={i} ref={el => { refs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-black bg-slate-900/50 border-2 border-white/10 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-white" />
            ))}
        </div>
    );
};

const LoginPage: React.FC<LoginPageProps> = ({
    authMode, setAuthMode, isLoading,
    loginUsername, setLoginUsername, loginPassword, setLoginPassword, handleLogin,
    signupData, setSignupData, handleSignup
}) => {
    const [step, setStep] = useState<'form' | 'otp'>('form');
    const [showPassword, setShowPassword] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [phoneOtp, setPhoneOtp] = useState<string[]>(blank6());
    const [sentOtp, setSentOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [isSending, setIsSending] = useState(false);

    const strength = getPasswordStrength(signupData.password || '');
    const sConfig = strengthConfig[strength.level];

    const sendOtp = async () => {
        setIsSending(true);
        await new Promise(r => setTimeout(r, 800));
        const code = generateOtp();
        setSentOtp(code); setPhoneOtp(blank6()); setOtpError(''); setStep('otp'); setIsSending(false);
        console.log(`[DEV] OTP → +63${signupData.number}: ${code}`);
    };

    const verifyOtp = () => {
        const entered = phoneOtp.join('');
        if (entered.length < 6) { setOtpError('Please enter the full 6-digit code.'); return; }
        if (entered !== sentOtp) { setOtpError('Incorrect code. Please try again.'); return; }
        setOtpError(''); handleSignup();
    };

    const resetToForm = () => { setStep('form'); setPhoneOtp(blank6()); setSentOtp(''); setOtpError(''); };

    // Common Input Style for the Dark Theme
    const inputClass = "w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-500";
    const labelClass = "block text-xs font-black text-white/50 uppercase tracking-widest mb-2";

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative font-sans overflow-hidden">
            {/* Background Image & Gamer Overlay (Matching your screenshot) */}
            <div className="absolute inset-0 bg-cover bg-center scale-105" 
                 style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')` }} />
            
            {/* The deep purple/blue gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-[#1a1b3a]/90 to-slate-950/95 backdrop-blur-[2px]" />

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Logo Header */}
                <div className="flex flex-col items-center justify-center mb-8 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-500 rounded-[14px] flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                            <span className="text-white font-black text-2xl">G</span>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">G-Stop</h1>
                    </div>
                    <p className="text-white/60 font-bold text-sm tracking-widest uppercase">The One-Stop Shop For Gamers</p>
                </div>

                {/* Main Glassmorphism Form Container */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
                    className="bg-[#1e1f3a]/60 backdrop-blur-xl border border-white/10 rounded-[30px] p-8 shadow-2xl relative overflow-hidden">
                    
                    {/* Top Tabs */}
                    <div className="flex mb-8 bg-slate-900/50 p-1 rounded-xl">
                        <button type="button" onClick={() => { setAuthMode('login'); resetToForm(); }}
                            className={`flex-1 py-2.5 text-sm font-black rounded-lg transition-all uppercase tracking-widest ${authMode === 'login' ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>
                            Login
                        </button>
                        <button type="button" onClick={() => { setAuthMode('signup'); resetToForm(); }}
                            className={`flex-1 py-2.5 text-sm font-black rounded-lg transition-all uppercase tracking-widest ${authMode === 'signup' ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>
                            Sign Up
                        </button>
                    </div>

                    {/* ══════════════ LOGIN ══════════════ */}
                    {authMode === 'login' && (
                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}>Username</label>
                                <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)}
                                    className={inputClass} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="Enter username" />
                            </div>
                            <div>
                                <label className={labelClass}>Password</label>
                                <div className="relative">
                                    <input type={showLoginPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                                        className={inputClass} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="••••••••" />
                                    <button type="button" onClick={() => setShowLoginPassword(p => !p)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-indigo-400 hover:text-indigo-300 uppercase">
                                        {showLoginPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>
                            <div className="pt-4">
                                <button type="button" onClick={handleLogin} disabled={isLoading}
                                    className="w-full bg-indigo-500 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl hover:bg-indigo-400 active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                                    {isLoading ? 'Authenticating...' : 'Secure Login'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ══════════════ SIGN UP — FORM ══════════════ */}
                    {authMode === 'signup' && step === 'form' && (
                        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div>
                                <label className={labelClass}>Full Name</label>
                                <input type="text" value={signupData.name} onChange={(e) => setSignupData({...signupData, name: e.target.value})} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Username</label>
                                <input type="text" value={signupData.username} onChange={(e) => setSignupData({...signupData, username: e.target.value})} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input type="email" value={signupData.email} onChange={(e) => setSignupData({...signupData, email: e.target.value})} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Phone Number</label>
                                <div className="flex gap-2">
                                    <span className="flex items-center px-4 bg-slate-900/50 border border-white/10 rounded-xl text-sm font-black text-white/50">+63</span>
                                    <input type="text" value={signupData.number} onChange={(e) => setSignupData({...signupData, number: e.target.value.replace(/\D/g, '')})} placeholder="9XXXXXXXXX" className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Password</label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} value={signupData.password} onChange={(e) => setSignupData({...signupData, password: e.target.value})} className={inputClass} />
                                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {signupData.password && (
                                    <div className="mt-3 space-y-2">
                                        <div className="flex gap-1">
                                            {[1,2,3,4,5].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.passed ? sConfig.color : 'bg-white/10'}`} />)}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="pt-4">
                                <button type="button" onClick={sendOtp} disabled={isSending}
                                    className="w-full bg-emerald-500 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                    {isSending ? 'Sending Code...' : 'Create Account'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ══════════════ SIGN UP — PHONE OTP ══════════════ */}
                    {authMode === 'signup' && step === 'otp' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <button type="button" onClick={resetToForm} className="text-xs font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                                <span>←</span> Back
                            </button>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-black text-white tracking-tight">Verify Phone</h3>
                                <p className="text-sm text-white/50 font-bold">Code sent to <span className="text-indigo-400">+63 {signupData.number}</span></p>
                                {sentOtp && <p className="text-xs bg-indigo-500/20 text-indigo-300 font-black px-3 py-1.5 rounded-lg inline-block mt-2">🛠 Dev Mode OTP: {sentOtp}</p>}
                            </div>
                            <OtpInput otp={phoneOtp} onChange={setPhoneOtp} />
                            <AnimatePresence>
                                {otpError && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-xs font-black text-red-400 bg-red-500/10 py-2 rounded-lg">⚠ {otpError}</motion.p>}
                            </AnimatePresence>
                            <div className="pt-2">
                                <button type="button" onClick={verifyOtp} disabled={isLoading}
                                    className="w-full bg-emerald-500 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-50">
                                    {isLoading ? 'Verifying...' : 'Complete Signup'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;