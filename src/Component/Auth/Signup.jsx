import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Eye, EyeOff, CheckCircle2, AlertCircle, BrainCircuit } from 'lucide-react';
import authService from '../../services/auth';
import signupCover from '../../assets/auth/signup_cover.png';

const Signup = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validation, setValidation] = useState({
        length: false,
        match: false,
        email: false
    });

    const navigate = useNavigate();

    useEffect(() => {
        setValidation({
            length: password.length >= 8,
            match: password.length > 0 && password === confirmPassword,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        });
    }, [password, confirmPassword, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validation.length) return setError('Password must be at least 8 characters');
        if (!validation.match) return setError('Passwords do not match');
        if (!validation.email) return setError('Please enter a valid email address');

        setLoading(true);
        setError('');
        try {
            await authService.signup({ full_name: fullName, email, password });
            await authService.login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex overflow-hidden">
            {/* Left Panel: Cover Image Section */}
            <div className="hidden lg:flex lg:w-1/2 relative">
                <img
                    src={signupCover}
                    alt="Knowledge Hub"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                {/* Branding on Image */}
                <div className="absolute bottom-16 left-16 right-16 z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center">
                            <BrainCircuit className="text-green-400" size={28} />
                        </div>
                        <span className="text-2xl font-black text-white tracking-widest">SYNTAXVERSE</span>
                    </div>
                    <h1 className="text-6xl font-black text-white leading-tight mb-6">
                        Architect Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Second Brain.</span>
                    </h1>
                    <p className="text-gray-400 text-lg font-medium max-w-md">
                        Join thousands of creators organizing their knowledge with cinematic precision.
                    </p>
                </div>
            </div>

            {/* Right Panel: Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-transparent relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-green-600/5 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative w-full max-w-md">
                    <div className="mb-10 lg:hidden flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/20 mb-6">
                            <UserPlus size={32} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight text-center">Join SyntaxVerse.</h2>
                    </div>

                    <div className="hidden lg:block mb-10">
                        <h2 className="text-4xl font-black text-white tracking-tight mb-2">Create Account</h2>
                        <p className="text-gray-500 font-semibold">Start your knowledge journey today</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold animate-shake">
                            <AlertCircle size={20} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Identity</label>
                            <div className="relative group">
                                <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-green-500 transition-colors" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-white outline-none focus:border-green-500/40 focus:bg-white/[0.05] transition-all font-medium text-lg"
                                    placeholder="Full Name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-green-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full pl-14 pr-6 py-4 bg-white/[0.03] border rounded-2xl text-white outline-none transition-all font-medium text-lg ${email && !validation.email ? 'border-red-500/30' : 'border-white/[0.05] focus:border-green-500/40'}`}
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Password</label>
                            <div className="relative group">
                                <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-green-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-14 py-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-white outline-none focus:border-green-500/40 transition-all font-medium text-lg"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Security Confirmation</label>
                            <div className="relative group">
                                <CheckCircle2 size={20} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${validation.match ? 'text-green-500' : 'text-gray-600'}`} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full pl-14 pr-6 py-4 bg-white/[0.03] border rounded-2xl text-white outline-none transition-all font-medium text-lg ${confirmPassword && !validation.match ? 'border-red-500/30' : 'border-white/[0.05] focus:border-green-500/40'}`}
                                    placeholder="Confirm Password"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password strength/match hints */}
                        <div className="flex flex-wrap gap-4 px-2 pt-1">
                            <div className={`flex items-center gap-2 text-[11px] font-bold ${validation.length ? 'text-green-500' : 'text-gray-600'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${validation.length ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                                8+ Characters
                            </div>
                            <div className={`flex items-center gap-2 text-[11px] font-bold ${validation.match ? 'text-green-500' : 'text-gray-600'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${validation.match ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                                Passwords Match
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 text-white rounded-2xl font-black text-lg shadow-2xl shadow-green-500/20 transition-all active:scale-[0.98] mt-4"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
                            ) : (
                                "Initiate Workspace"
                            )}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-gray-500 font-medium">
                        Already armed?{' '}
                        <Link to="/login" className="text-white font-black hover:text-green-400 transition-colors ml-1">Log In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
