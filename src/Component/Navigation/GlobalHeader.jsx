import React, { useState, useEffect } from "react";
import { Home, Settings, Bell, LogOut, FileText, User, Shapes, Orbit, Activity, Menu, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/auth";
import api from "../../services/api";
import ZenPlayer from "../UI/ZenPlayer";
import logo from "../../assets/logo/syntaxverse_logo.png";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState({ ok: true, code: 200, latency: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkStatus = async () => {
      const health = await api.getHealth();
      setStatus({ ok: health.ok, code: health.status, latency: health.latency });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate("/login");
  };

  const isAuthenticated = authService.isAuthenticated();

  return (
    <nav className="w-full fixed top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 px-4 shadow-xl">
      <div className="w-full mx-auto h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-white/5 transition-all duration-300 transform group-hover:scale-110 shadow-lg shadow-blue-500/20 overflow-hidden border border-white/10 p-1">
            <img src={logo} alt="SyntaxVerse" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="text-xl font-black text-white tracking-widest uppercase font-display leading-tight">
              SYNTAX<span className="text-blue-500">VERSE</span>
            </div>
            <div className="flex items-center gap-1.5 px-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${status.ok ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${status.ok ? 'text-green-500/80' : 'text-red-500/80'}`}>
                System {status.ok ? 'Online' : 'Offline'} • {status.code} • {status.latency}ms
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation - Desktop */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/" className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${location.pathname === '/' ? 'bg-white/5 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Home size={18} />
            <span className="font-display uppercase tracking-widest text-[10px]">Home</span>
          </Link>
          <Link to="/notes" className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${location.pathname.startsWith('/notes') ? 'bg-white/5 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <FileText size={18} />
            <span className="font-display uppercase tracking-widest text-[10px]">Workspace</span>
          </Link>
          <Link to="/canvas" className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${location.pathname === '/canvas' ? 'bg-white/5 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Shapes size={18} />
            <span className="font-display uppercase tracking-widest text-[10px]">Canvas</span>
          </Link>
          <Link to="/galaxy" className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${location.pathname === '/galaxy' ? 'bg-white/5 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Orbit size={18} />
            <span className="font-display uppercase tracking-widest text-[10px]">Galaxy</span>
          </Link>
          <a
            href="https://self-dev-learning-platform.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all text-gray-400 hover:text-white hover:bg-white/5"
          >
            <Orbit size={18} />
            <span className="font-display uppercase tracking-widest text-[10px]">
              Learn More
            </span>
          </a>

        </div>

        {/* Right Section: ZenPlayer & Profile & Mobile Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden lg:block">
            {isAuthenticated && <ZenPlayer />}
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 md:gap-4">
              <button className="text-gray-400 hover:text-white transition-colors relative p-2 rounded-lg hover:bg-white/5">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
              </button>

              <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block"></div>

              <div className="flex items-center gap-3 pl-1">
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-black text-white tracking-tight">{user?.full_name || 'Innovator'}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Creator</p>
                </div>
                <div className="relative group cursor-pointer hidden sm:block">
                  <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <User size={20} />
                  </div>

                  {/* Dropdown menu */}
                  <div className="absolute right-0 top-full pt-4 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="bg-[#111111]/95 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl overflow-hidden py-2">
                      <div className="px-4 py-3 border-b border-white/5 mb-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Account</p>
                        <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                      </div>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 transition-colors font-medium">
                        <Settings size={16} /> Profile Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-3 transition-colors font-bold mt-1"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login" className="px-5 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all md:hidden"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 top-16 z-40 bg-black/95 backdrop-blur-xl transition-all duration-300 md:hidden ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
        <div className="flex flex-col bg-black p-6 gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">Navigation</p>
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-xl font-bold text-white p-2">
              <Home className="text-blue-500" /> Home
            </Link>
            <Link to="/notes" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-xl font-bold text-white p-2">
              <FileText className="text-blue-500" /> Workspace
            </Link>
            <Link to="/canvas" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-xl font-bold text-white p-2">
              <Shapes className="text-blue-500" /> Canvas
            </Link>
            <Link to="/galaxy" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-xl font-bold text-white p-2">
              <Orbit className="text-blue-500" /> Galaxy
            </Link>

          </div>

          <div className="h-[1px] bg-white/5"></div>

          {isAuthenticated ? (
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Account</p>
              <div className="flex items-center gap-4 p-2">
                <div className="h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-lg font-black text-white">{user?.full_name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                {isAuthenticated && <div className="mb-2 w-fit"><ZenPlayer /></div>}
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="flex items-center gap-4 text-xl font-bold text-red-500 p-2"
                >
                  <LogOut /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full py-4 text-center text-lg font-black text-white border border-white/10 rounded-2xl">
                Sign In
              </Link>
              <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="w-full py-4 text-center text-lg font-black text-white bg-blue-600 rounded-2xl">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
