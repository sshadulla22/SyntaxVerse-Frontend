import React from "react";
import { Link } from "react-router-dom";
import { MoveLeft, Home, AlertTriangle, ShieldX, HelpCircle } from "lucide-react";

const ErrorPage = ({ code = "404", message = "Space time anomaly detected." }) => {
    const errorConfigs = {
        "404": {
            icon: <HelpCircle size={80} className="text-blue-500" />,
            title: "Sector Not Found",
            description: "The coordinate you're attempting to reach doesn't exist in this galaxy. It may have been collapsed or moved to another dimension.",
            action: "Return to Base"
        },
        "500": {
            icon: <AlertTriangle size={80} className="text-red-500" />,
            title: "Core Meltdown",
            description: "A catastrophic system failure has occurred. Our droids are working to stabilize the reactor core.",
            action: "Emergency Evacuation"
        },
        "403": {
            icon: <ShieldX size={80} className="text-purple-500" />,
            title: "Access Denied",
            description: "Your security clearance is insufficient for this restricted sector. Unauthorized access is recorded.",
            action: "Request Protocol"
        }
    };

    const config = errorConfigs[code] || errorConfigs["404"];

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[20%] left-[10%] w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-[20%] right-[10%] w-[25rem] h-[25rem] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl text-center">
                {/* Visual Icon */}
                <div className="mb-12 flex justify-center transform transition-transform duration-500 hover:scale-110">
                    <div className="relative">
                        <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full"></div>
                        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/10">
                            {config.icon}
                        </div>
                    </div>
                </div>

                {/* Status Code */}
                <div className="mb-2">
                    <span className="text-[120px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent select-none">
                        {code}
                    </span>
                </div>

                {/* Content */}
                <div className="relative -mt-16">
                    <h1 className="text-5xl font-black text-white tracking-tight mb-6 uppercase italic">
                        {config.title}
                    </h1>
                    <p className="text-gray-400 text-xl font-medium max-w-lg mx-auto mb-12 leading-relaxed h-24">
                        {config.description}
                    </p>

                    {/* Navigation Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            to="/"
                            className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black text-lg hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                        >
                            <Home size={20} />
                            <span>{config.action}</span>
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all active:scale-95"
                        >
                            <MoveLeft size={20} />
                            <span>Previous Sector</span>
                        </button>
                    </div>
                </div>

                {/* Meta info */}
                <div className="mt-24 pt-8 border-t border-white/5 opacity-40">
                    <div className="flex items-center justify-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                        <span>SYNTAXVERSE OS v1.0.4</span>
                        <span>SESSIONID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
