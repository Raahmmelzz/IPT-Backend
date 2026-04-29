import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
    authMode: 'login' | 'signup';
    setAuthMode: (mode: 'login' | 'signup') => void;
    onClose: () => void;
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

// ── Password strength (visual only, never blocks submit) ───────────────────
const strengthConfig = {
    weak:   { label: 'Weak',   color: 'bg-red-500',    text: 'text-red-500' },
    fair:   { label: 'Fair',   color: 'bg-orange-400', text: 'text-orange-400' },
    good:   { label: 'Good',   color: 'bg-yellow-500', text: 'text-yellow-500' },
    strong: { label: 'Strong', color: 'bg-green-500',  text: 'text-green-600' },
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
    const level: keyof typeof strengthConfig =
        passed <= 1 ? 'weak' : passed <= 3 ? 'fair' : passed === 4 ? 'good' : 'strong';
    return { checks, passed, level };
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const blank6      = (): string[] => ['', '', '', '', '', ''];

// ── OTP Input (useRef — no typing bug) ────────────────────────────────────
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
                <input
                    key={i}
                    ref={el => { refs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="w-11 h-12 text-center text-lg font-bold border-2 border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800"
                />
            ))}
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────
const AuthModal: React.FC<AuthModalProps> = ({
    authMode, setAuthMode, onClose, isLoading,
    loginUsername, setLoginUsername, loginPassword, setLoginPassword, handleLogin,
    signupData, setSignupData, handleSignup
}) => {
    const [step, setStep]                 = useState<'form' | 'otp'>('form');
    const [showPassword, setShowPassword]      = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [phoneOtp, setPhoneOtp]         = useState<string[]>(blank6());
    const [sentOtp, setSentOtp]           = useState('');
    const [otpError, setOtpError]         = useState('');
    const [isSending, setIsSending]       = useState(false);

    const strength = getPasswordStrength(signupData.password || '');
    const sConfig  = strengthConfig[strength.level];

    const sendOtp = async () => {
        setIsSending(true);
        await new Promise(r => setTimeout(r, 800));
        const code = generateOtp();
        setSentOtp(code);
        setPhoneOtp(blank6());
        setOtpError('');
        setStep('otp');
        setIsSending(false);
        console.log(`[DEV] OTP → +63${signupData.number}: ${code}`);
    };

    const resendOtp = async () => {
        setIsSending(true);
        await new Promise(r => setTimeout(r, 800));
        const code = generateOtp();
        setSentOtp(code);
        setPhoneOtp(blank6());
        setOtpError('');
        setIsSending(false);
        console.log(`[DEV] Resent OTP: ${code}`);
    };

    const verifyOtp = () => {
        const entered = phoneOtp.join('');
        if (entered.length < 6) { setOtpError('Please enter the full 6-digit code.'); return; }
        if (entered !== sentOtp) { setOtpError('Incorrect code. Please try again.'); return; }
        setOtpError('');
        handleSignup();
    };

    const resetToForm = () => {
        setStep('form');
        setPhoneOtp(blank6());
        setSentOtp('');
        setOtpError('');
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative"
            >
                {/* ── Tabs ── */}
                <div className="flex mb-6 border-b border-slate-200">
                    <button type="button" onClick={() => { setAuthMode('login'); resetToForm(); }}
                        className={`flex-1 pb-3 text-sm font-bold transition-colors border-b-2 ${authMode === 'login' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                        Login
                    </button>
                    <button type="button" onClick={() => { setAuthMode('signup'); resetToForm(); }}
                        className={`flex-1 pb-3 text-sm font-bold transition-colors border-b-2 ${authMode === 'signup' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                        Sign Up
                    </button>
                </div>

                {/* ══════════════ LOGIN ══════════════ */}
                {authMode === 'login' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Username</label>
                            <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
                            <div className="relative">
                                <input type={showLoginPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 pr-11 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                                <button type="button" onClick={() => setShowLoginPassword(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors select-none">
                                    {showLoginPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button type="button" onClick={handleLogin} disabled={isLoading}
                                className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                                {isLoading ? 'Verifying...' : 'Login'}
                            </button>
                            {/* We keep the Cancel button wired up. If they are in forced-login mode, Store.tsx passes an empty function so it won't break anything. */}
                            <button type="button" onClick={onClose} className="px-5 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                        </div>
                    </div>
                )}

                {/* ══════════════ SIGN UP — FORM ══════════════ */}
                {authMode === 'signup' && step === 'form' && (
                    <div className="space-y-3 max-h-[65vh] overflow-y-auto px-1 scrollbar-hide">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                            <input type="text" value={signupData.name}
                                onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                            <input type="text" value={signupData.username}
                                onChange={(e) => setSignupData({...signupData, username: e.target.value})}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                            <input type="email" value={signupData.email}
                                onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>

                        {/* Phone Number with +63 prefix */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                            <div className="flex gap-2">
                                <span className="flex items-center px-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-500 bg-slate-50">+63</span>
                                <input type="text" value={signupData.number}
                                    onChange={(e) => setSignupData({...signupData, number: e.target.value.replace(/\D/g, '')})}
                                    placeholder="9XXXXXXXXX"
                                    className="flex-1 border border-slate-300 rounded-xl px-4 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>

                        {/* Password + strength bar */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={signupData.password}
                                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2 pr-10 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                <button type="button" onClick={() => setShowPassword(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {signupData.password && (
                                <div className="mt-2 space-y-1.5">
                                    <div className="flex gap-1">
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.passed ? sConfig.color : 'bg-slate-200'}`} />
                                        ))}
                                    </div>
                                    <p className={`text-xs font-bold ${sConfig.text}`}>{sConfig.label} password</p>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                                        {[
                                            { key: 'length',    label: '8+ characters' },
                                            { key: 'uppercase', label: 'Uppercase letter' },
                                            { key: 'lowercase', label: 'Lowercase letter' },
                                            { key: 'number',    label: 'Number' },
                                            { key: 'special',   label: 'Special character' },
                                        ].map(({ key, label }) => (
                                            <p key={key} className={`text-xs font-bold flex items-center gap-1 ${strength.checks[key as keyof typeof strength.checks] ? 'text-green-600' : 'text-slate-400'}`}>
                                                {strength.checks[key as keyof typeof strength.checks] ? '✓' : '○'} {label}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-4 pt-2">
                            <button type="button" onClick={sendOtp} disabled={isSending}
                                className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors">
                                {isSending ? 'Sending code...' : 'Create Account'}
                            </button>
                            <button type="button" onClick={onClose} className="px-5 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                        </div>
                    </div>
                )}

                {/* ══════════════ SIGN UP — PHONE OTP ══════════════ */}
                {authMode === 'signup' && step === 'otp' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                        <button type="button" onClick={resetToForm} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                            ← Back to form
                        </button>

                        <div className="text-center space-y-2">
                            <div className="text-4xl">📱</div>
                            <h3 className="text-base font-bold text-slate-800">Verify your phone number</h3>
                            <p className="text-sm text-slate-500">
                                We sent a 6-digit SMS code to<br />
                                <span className="font-bold text-indigo-600">+63 {signupData.number}</span>
                            </p>
                            {/* DEV badge — remove in production */}
                            {sentOtp && (
                                <p className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 font-bold px-3 py-1.5 rounded-lg inline-block">
                                    🛠 Dev mode — OTP: {sentOtp}
                                </p>
                            )}
                        </div>

                        <OtpInput otp={phoneOtp} onChange={setPhoneOtp} />

                        <AnimatePresence>
                            {otpError && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="text-center text-xs font-bold text-red-500 bg-red-50 py-2 rounded-xl">
                                    ⚠ {otpError}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-3">
                            <button type="button" onClick={verifyOtp} disabled={isLoading}
                                className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors">
                                {isLoading ? 'Verifying...' : '✓ Verify & Create'}
                            </button>
                            <button type="button" onClick={onClose} className="px-5 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                        </div>

                        <p className="text-center text-xs text-slate-400">
                            Didn't receive it?{' '}
                            <button type="button" onClick={resendOtp} disabled={isSending}
                                className="text-indigo-600 font-bold hover:underline disabled:opacity-50">
                                {isSending ? 'Sending...' : 'Resend code'}
                            </button>
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default AuthModal;