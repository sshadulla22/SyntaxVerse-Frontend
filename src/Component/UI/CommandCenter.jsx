import React, { useState, useEffect, useRef } from "react";
import { Search, FileText, Folder, Command } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const CommandCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    useEffect(() => {
        const down = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setSelectedIndex(0);
        } else {
            setQuery("");
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const search = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            const data = await api.searchNotes(query);
            setResults(data);
            setLoading(false);
            setSelectedIndex(0);
        };

        const timer = setTimeout(search, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((i) => (i + 1) % results.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((i) => (i - 1 + results.length) % results.length);
        } else if (e.key === "Enter" && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    };

    const handleSelect = (item) => {
        setIsOpen(false);
        if (item.is_folder) {
            navigate(`/notes/${item.id}`);
        } else {
            navigate(`/note/${item.id}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center px-4 border-b border-white/5">
                    <Search className="text-gray-500 mr-3" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search notes, folders, architecture..."
                        className="w-full h-14 bg-transparent text-white outline-none font-display text-lg"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/10 text-[10px] text-gray-500 font-bold uppercase tracking-tighter ml-2">
                        <Command size={10} />
                        <span>ESC</span>
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto py-2">
                    {loading ? (
                        <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Scanning Galaxy...</p>
                        </div>
                    ) : results.length > 0 ? (
                        results.map((item, index) => (
                            <button
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                className={`w-full flex items-center gap-4 px-4 py-3 transition-colors ${index === selectedIndex ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'
                                    }`}
                            >
                                {item.is_folder ? <Folder size={18} /> : <FileText size={18} />}
                                <div className="flex flex-col items-start overflow-hidden">
                                    <span className="text-sm font-bold truncate w-full">{item.title}</span>
                                    <span className="text-[10px] uppercase tracking-widest opacity-60">
                                        {item.is_folder ? 'Folder' : 'Note'}
                                    </span>
                                </div>
                            </button>
                        ))
                    ) : query.length >= 2 ? (
                        <div className="px-4 py-12 flex flex-col items-center justify-center gap-3">
                            <Search size={32} className="text-gray-700" />
                            <p className="text-sm text-gray-500 font-bold">No results found for "{query}"</p>
                        </div>
                    ) : (
                        <div className="px-4 py-12 flex flex-col items-center justify-center gap-3 opacity-40">
                            <div className="flex items-center gap-3">
                                <FileText size={20} />
                                <div className="w-24 h-2 bg-white/10 rounded"></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Folder size={20} />
                                <div className="w-32 h-2 bg-white/10 rounded"></div>
                            </div>
                            <p className="text-[10px] uppercase font-black tracking-[0.3em] mt-2">Start typing to search the cosmos</p>
                        </div>
                    )}
                </div>

                <div className="bg-black/40 px-4 py-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase">
                            <kbd className="bg-white/5 px-1 rounded border border-white/10">ESC</kbd>
                            <span>Close</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase">
                            <kbd className="bg-white/5 px-1 rounded border border-white/10">ENTER</kbd>
                            <span>Select</span>
                        </div>
                    </div>
                    <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest">
                        ANCText Command Center
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandCenter;
