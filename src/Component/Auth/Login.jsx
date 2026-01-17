import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Github, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import authService from '../../services/auth';
import api from '../../services/api';
import loginCover from '../../assets/auth/login_cover.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ ok: null, code: null, latency: 0 });
    const navigate = useNavigate();

    React.useEffect(() => {
        const checkStatus = async () => {
            const health = await api.getHealth();
            setStatus({ ok: health.ok, code: health.status, latency: health.latency });
        };
        checkStatus();
        const interval = setInterval(checkStatus, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
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
            {/* Left Panel: Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-transparent relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-600/5 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative w-full max-w-md">
                    <div className="mb-10 lg:hidden flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6">
                            <LogIn size={32} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight text-center">SyntaxVerse Login.</h2>
                    </div>

                    <div className="hidden lg:block mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-4xl font-black text-white tracking-tight">Welcome Back</h2>
                            {status.code && (
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${status.ok ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'} transition-all duration-500`}>
                                    <div className={`w-2 h-2 rounded-full ${status.ok ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${status.ok ? 'text-green-500' : 'text-red-500'}`}>
                                        {status.code} • {status.latency}ms
                                    </span>
                                </div>
                            )}
                        </div>
                        <p className="text-gray-500 font-semibold text-lg">Your second brain is waiting</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold animate-shake">
                            <AlertCircle size={20} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Identity</label>
                            <div className="relative group">
                                <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-white outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all font-medium text-lg"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Security</label>
                                <button type="button" className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors bg-transparent border-none p-0 cursor-pointer">Forgot?</button>
                            </div>
                            <div className="relative group">
                                <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-14 py-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-white outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all font-medium text-lg"
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

                        <div className="flex items-center gap-3 px-2">
                            <input type="checkbox" id="remember" className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-blue-600 focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer" />
                            <label htmlFor="remember" className="text-sm font-semibold text-gray-500 cursor-pointer select-none">Stay signed in</label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-500/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Enter Workspace</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10">
                        <div className="relative mb-10">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/[0.05]"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black">
                                <span className="bg-[#0A0A0A] px-6 text-gray-600">Secure Access</span>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-2xl flex items-center justify-center gap-4 transition-all font-bold text-white group">
                            <Github size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="text-lg">Access with Github</span>
                        </button>
                    </div>

                    <p className="mt-10 text-center text-gray-500 font-medium">
                        New to the hub?{' '}
                        <Link to="/signup" className="text-white font-black hover:text-blue-400 transition-colors ml-1">Create Account</Link>
                    </p>
                </div>
            </div>

            {/* Right Panel: Cover Image Section */}
            <div className="hidden lg:flex lg:w-1/2 relative border-l border-white/5">
                <img
                    src={loginCover}
                    alt="Network"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                {/* Branding on Image */}
                <div className="absolute bottom-16 left-16 right-16 z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="text-blue-400" size={28} />
                        </div>
                        <span className="text-2xl font-black text-white tracking-widest">SECURE</span>
                    </div>
                    <h1 className="text-6xl font-black text-white leading-tight mb-6">
                        Access Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Digital Vault.</span>
                    </h1>
                    <p className="text-gray-400 text-lg font-medium max-w-md">
                        Your encrypted thoughts and projects, available anytime, anywhere.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
