import React, { useState, useEffect, useRef } from "react";
import GlobalHeader from "./Navigation/GlobalHeader";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    Edit3,
    X,
    Play,
    Terminal,
    Code as CodeIcon,
    FileText,
    AlertCircle,
    Bold,
    Italic,
    List,
    Type,
    Download,
    Copy,
    Check,
    CheckSquare,
    Eye,
    ChevronDown
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from "../services/api";

const Note = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState(null);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    // Refs for synchronization
    const editorRef = useRef(null);
    const gutterRef = useRef(null);

    // Code Playground States
    const [codeSnippet, setCodeSnippet] = useState("// Type your code here...");
    const [language, setLanguage] = useState("javascript");
    const [terminalLogs, setTerminalLogs] = useState([
        { type: 'info', message: 'System initialized. Ready for input.' }
    ]);
    const [showPlayground, setShowPlayground] = useState(true);

    const languages = [
        { id: "javascript", name: "JavaScript (Node)", version: "18.15.0" },
        { id: "python", name: "Python", version: "3.10.0" },
        { id: "java", name: "Java", version: "15.0.2" },
        { id: "c++", name: "C++", version: "10.2.0" },
        { id: "go", name: "Go", version: "1.16.2" },
        { id: "rust", name: "Rust", version: "1.68.2" },
    ];

    useEffect(() => {
        loadNote();
    }, [id]);

    useEffect(() => {
        // Update default snippet based on language if empty or default
        if (codeSnippet.startsWith("// Type")) {
            if (language === 'python') setCodeSnippet('print("Hello from Python!")');
            else if (language === 'java') setCodeSnippet('public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}');
            else if (language === 'c++') setCodeSnippet('#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}');
            else if (language === 'go') setCodeSnippet('package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go!")\n}');
            else if (language === 'rust') setCodeSnippet('fn main() {\n    println!("Hello from Rust!");\n}');
            else setCodeSnippet("// Type your JavaScript code here...\nconsole.log('Hello from ANCtext!');");
        }
    }, [language]);

    // Simple Debounced Auto-save Logic
    useEffect(() => {
        if (!isEditing || !note) return;

        const timer = setTimeout(() => {
            handleSave(true); // silent save
        }, 3000);

        return () => clearTimeout(timer);
    }, [content, title]);

    const loadNote = async () => {
        try {
            setLoading(true);
            const data = await api.getNote(id);
            setNote(data);
            setTitle(data.title);
            setContent(data.content || "");
            // Optionally pull code snippet from content if formatted specially
        } catch (error) {
            console.error("Error loading note:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (silent = false) => {
        if (!id) return;
        try {
            if (!silent) setSaving(true);
            await api.updateNote(id, { title, content });
            if (!silent) {
                setIsEditing(false);
                // toast/alert replaced with subtle feedback in future
            }
        } catch (error) {
            console.error("Error saving note:", error);
            if (!silent) alert("Failed to save note");
        } finally {
            if (!silent) setSaving(false);
        }
    };

    const handleRunCode = async () => {
        setTerminalLogs(prev => [...prev, { type: 'command', message: `Running ${language}...` }]);

        // Client-side execution for pure JS (optional, can be removed to use Piston for everything to be consistent)
        // But user asked for "any type of code", so server-side is safer and more robust.
        // However, for "JavaScript (Browser)", we can keep client side, but "JavaScript (Node)" should go to server.
        // Let's settle on using the Server for everything except specific "Browser JS" mode if we added it.
        // For now, let's route ALL through Piston for consistency and security, OR keep browser for immediate feedback.
        // Let's keep Browser JS execution if language is 'javascript' AND valid browser code?
        // Actually, Piston provides Node.js environment which is better for "Universal Compiler".
        // Let's switch to server-side for everything to support "Universal" properly.

        try {
            const result = await api.executeCode(language, codeSnippet);

            if (result.run) {
                // Handle Piston Response
                if (result.run.stdout) {
                    result.run.stdout.split('\n').forEach(line => {
                        if (line) setTerminalLogs(prev => [...prev, { type: 'log', message: line }]);
                    });
                }
                if (result.run.stderr) {
                    result.run.stderr.split('\n').forEach(line => {
                        if (line) setTerminalLogs(prev => [...prev, { type: 'error', message: line }]);
                    });
                }
                if (!result.run.stdout && !result.run.stderr) {
                    setTerminalLogs(prev => [...prev, { type: 'info', message: 'Execution finished (no output).' }]);
                }
            } else {
                setTerminalLogs(prev => [...prev, { type: 'error', message: 'Execution failed: No run data.' }]);
            }

        } catch (err) {
            setTerminalLogs(prev => [...prev, { type: 'error', message: `Execution Error: ${err.message}` }]);
        }
    };

    const clearTerminal = () => {
        setTerminalLogs([{ type: 'info', message: 'Terminal cleared.' }]);
    };

    const insertMarkdown = (markdown) => {
        if (!isEditing) return;
        const textarea = document.querySelector('textarea[placeholder="Start writing your thoughts..."]');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);

        let newText = before + markdown + after;

        // If selection exists, wrap it (for bold/italic)
        if (start !== end && (markdown === '**' || markdown === '*')) {
            newText = before + markdown + text.substring(start, end) + markdown + after;
        }

        setContent(newText);

        // Restore focus and cursor
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + markdown.length + (start !== end ? text.substring(start, end).length + markdown.length : 0);
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: "text/markdown" });
        element.href = URL.createObjectURL(file);
        // Sanitize filename
        const safeTitle = (title || "untitled").replace(/[^a-z0-9]/gi, '_').toLowerCase();
        element.download = `${safeTitle}.md`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleChangeCover = async () => {
        const keywords = ["nature", "tech", "abstract", "space", "minimal", "texture"];
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        const newCover = `https://images.unsplash.com/photo-${Date.now()}?q=80&w=2000&auto=format&fit=crop&sig=${Math.random()}&keyword=${randomKeyword}`;

        try {
            setNote(prev => ({ ...prev, cover_image: newCover }));
            await api.updateNote(id, { cover_image: newCover });
        } catch (error) {
            console.error("Error updating cover:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex bg-black flex-col h-screen">
                <GlobalHeader />
                <div className="flex flex-col items-center justify-center flex-1 gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-medium">Opening your note...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-gray-100 flex flex-col font-sans">
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <GlobalHeader />

            <main className="flex-1 mt-14 p-2 md:p-3 flex flex-col gap-3 w-full h-[calc(100vh-56px)] overflow-hidden">

                {/* Compact Cover Image Section */}
                <div className="relative w-full h-4 md:h-28 shrink-0 rounded-2xl overflow-hidden group border border-white/5 shadow-2xl">
                    <img
                        src={note?.cover_image || "https://th.bing.com/th/id/R.c287231a4a0984de41cba7188a78cd06?rik=CyKJtMg0oU3WCQ&riu=http%3a%2f%2fgetwallpapers.com%2fwallpaper%2ffull%2f9%2fc%2f2%2f797168-download-free-universe-wallpaper-hd-1920x1200.jpg&ehk=RheGKVQLTvxv55I8g9r7S6j2TJBwnnOs92qPqhF45tE%3d&risl=&pid=ImgRaw&r=0"}
                        alt="Note Cover"
                        className="w-full h-full object-cover transition-all duration-700 opacity-80 group-hover:opacity-100 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                    {/* Dynamic Title Overlay */}
                    <div className="absolute bottom-4 left-6 right-6 z-10 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-1 opacity-80 font-display">Workspace / {note?.folder_name || 'General'}</span>
                            <h2 className="text-xl md:text-4xl font-black text-White truncate max-w-[500px] drop-shadow-2xl">
                                {title || "Untitled Perspective"}
                            </h2>
                        </div>
                    </div>

                    {/* Cover Actions Layer */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleChangeCover}
                            className="bg-black/60 backdrop-blur-md text-white/80 hover:text-white px-2 py-1 rounded-lg text-[10px] font-bold border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5"
                        >
                            <Edit3 size={14} />
                            Change Cover
                        </button>
                    </div>
                </div>

                {/* Slimmed Action Bar */}
                <header className="bg-black sticky top-0 z-10 border border-[#333333] p-2 rounded-xl shadow-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => navigate("/")}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            title="Back to Topics"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="h-6 w-[1px] bg-gray-800"></div>
                        <div className="flex items-center gap-3 flex-1 px-1">
                            <FileText size={16} className="text-blue-500 shrink-0" />
                            <input
                                className={`bg-transparent text-base font-black outline-none transition-all w-full font-display ${isEditing ? 'text-white border-b border-blue-500/50' : 'text-gray-300 pointer-events-none'}`}
                                placeholder="Untitled Note"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            title="Copy to Clipboard"
                        >
                            {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                        </button>
                        <button
                            onClick={handleDownload}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            title="Download Note"
                        >
                            <Download size={20} />
                        </button>

                        <div className="h-6 w-[1px] bg-gray-800 mx-1"></div>

                        <button
                            onClick={() => setShowPlayground(!showPlayground)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border ${showPlayground ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' : 'bg-[#1a1a1a] border-[#333333] text-gray-500 hover:text-white'}`}
                        >
                            <CodeIcon size={14} />
                            <span className="hidden md:inline">{showPlayground ? "Hide Playground" : "Show Playground"}</span>
                        </button>

                        <div className="h-6 w-[1px] bg-gray-800 mx-1"></div>

                        {(isEditing || (note && (content !== note.content || title !== note.title))) ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setTitle(note.title);
                                        setContent(note.content || "");
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                >
                                    <X size={16} />
                                    <span className="hidden sm:inline">Cancel</span>
                                </button>
                                <button
                                    onClick={() => handleSave(false)}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    <span>{saving ? "Saving..." : "Save"}</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold bg-[#1a1a1a] hover:bg-[#222222] border border-[#333333] text-white rounded-lg transition-all"
                            >
                                <Edit3 size={16} />
                                <span>Edit</span>
                            </button>
                        )}
                    </div>
                </header>

                {/* Main Content Area - Grid */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-3">

                    {/* Note Editor Pane */}
                    <div className="flex-1 bg-[#111111] border border-[#333333] rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">

                        {/* Terminal Box - Top Position */}
                        {showPlayground && (
                            <div className="flex-[0_0_200px] bg-none border-b border-[#333333] flex flex-col shrink-0">
                                <div className="bg-transparent px-4 py-2 border-b border-[#30363d] flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Terminal size={12} className="text-[#8b949e]" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e] font-display">Terminal</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={clearTerminal}
                                            className="text-[10px] font-bold text-gray-600 hover:text-gray-400 transition-colors uppercase tracking-tighter"
                                        >
                                            Clear
                                        </button>
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 p-4 font-mono text-xs overflow-auto no-scrollbar space-y-1.5 bg-[#0d1117]">
                                    {terminalLogs.map((log, index) => (
                                        <div key={index} className="flex items-start gap-2.5 opacity-90 hover:opacity-100 transition-opacity">
                                            {log.type === 'command' && <span className="text-blue-500 font-bold shrink-0 mt-[1px]">➜</span>}
                                            {log.type === 'error' && <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />}
                                            {log.type === 'log' && <span className="text-emerald-500 shrink-0 mt-[1px]">✓</span>}
                                            {log.type === 'info' && <span className="text-gray-600 shrink-0 mt-[1px]">i</span>}
                                            <span className={`leading-relaxed break-all ${log.type === 'error' ? 'text-red-400 font-medium' :
                                                log.type === 'command' ? 'text-blue-200 font-medium' :
                                                    log.type === 'log' ? 'text-gray-300' : 'text-gray-500 italic'
                                                }`}>
                                                {log.message}
                                            </span>
                                        </div>
                                    ))}
                                    {terminalLogs.length === 0 && (
                                        <div className="text-gray-700 italic select-none">Waiting for output...</div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Editor Toolbar - Only visible when editing or content exists */}
                        <div className={`px-4 py-2 border-b border-[#1a1a1a] flex items-center justify-between transition-all ${isEditing ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <div className="flex items-center gap-2">
                                <button onClick={() => insertMarkdown('**')} className="p-1.5 text-gray-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors" title="Bold">
                                    <Bold size={14} />
                                </button>
                                <button onClick={() => insertMarkdown('*')} className="p-1.5 text-gray-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors" title="Italic">
                                    <Italic size={14} />
                                </button>
                                <div className="w-[1px] h-4 bg-[#333333] mx-1"></div>
                                <button onClick={() => insertMarkdown('# ')} className="p-1.5 text-gray-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors" title="Heading">
                                    <Type size={14} />
                                </button>
                                <button onClick={() => insertMarkdown('- ')} className="p-1.5 text-gray-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors" title="List">
                                    <List size={14} />
                                </button>
                                <button onClick={() => insertMarkdown('- [ ] ')} className="p-1.5 text-gray-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors" title="Task">
                                    <CheckSquare size={14} />
                                </button>
                            </div>
                            <button
                                onClick={() => setIsPreview(!isPreview)}
                                className={`flex items-center gap-2 px-2 py-1 text-[10px] font-bold rounded-lg transition-colors ${isPreview ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
                                title={isPreview ? "Edit Mode" : "Preview Mode"}
                            >
                                <Eye size={14} />
                                <span className="hidden sm:inline">{isPreview ? 'Edit' : 'Preview'}</span>
                            </button>
                        </div>

                        {isPreview ? (
                            <div className="flex-1 bg-black overflow-auto p-6 no-scrollbar prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                            </div>
                        ) : (
                            <textarea
                                className={`flex-1 bg-black text-gray-200 outline-none resize-none leading-relaxed text-sm font-normal  bg-[length:100%_28px] px-2 no-scrollbar ${!isEditing ? 'cursor-cursor' : ''}`}
                                placeholder="Start writing your thoughts..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onClick={() => { if (!isEditing) setIsEditing(true); }}
                                disabled={!isEditing && false}
                                style={{ lineHeight: '28px' }} // Match gradient for lined paper effect
                            />
                        )}
                        <div className="px-6 py-3 flex items-center justify-between text-[10px] text-gray-600 font-bold uppercase tracking-widest border-t border-[#1a1a1a] bg-[#111111]/50 backdrop-blur-sm">
                            <div className="flex gap-4">
                                <span>{content.length} chars</span>
                                <span>{content.split(/\s+/).filter(w => w.length > 0).length} words</span>
                            </div>
                            <span>{Math.ceil(content.split(/\s+/).filter(w => w.length > 0).length / 200)} min read</span>
                        </div>
                    </div>

                    {/* Code Compiler Pane - Toggleable */}
                    {showPlayground && (
                        <div className="w-full lg:w-[400px] xl:w-[480px] flex flex-col gap-3 h-screen animate-in slide-in-from-right duration-300">

                            {/* Editor Box */}
                            <div className="flex-1 bg-[#111111] border border-[#333333] rounded-2xl overflow-hidden flex flex-col shadow-2xl h-full">
                                <div className="bg-black/50 px-5 py-3 border-b border-[#333333] flex items-center justify-between">
                                    <div className="flex items-center gap-2 relative">
                                        <CodeIcon size={16} className="text-blue-500" />

                                        {/* Custom Dropdown Trigger */}
                                        <button
                                            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                                            className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-gray-300 hover:text-white transition-colors outline-none"
                                        >
                                            {languages.find(l => l.id === language)?.name}
                                            <ChevronDown size={12} className={`transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isLangMenuOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setIsLangMenuOpen(false)}></div>
                                                <div className="absolute top-full left-0 mt-2 w-48 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                    {languages.map(lang => (
                                                        <button
                                                            key={lang.id}
                                                            onClick={() => {
                                                                setLanguage(lang.id);
                                                                setIsLangMenuOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center justify-between ${language === lang.id
                                                                    ? 'bg-blue-600/10 text-blue-400'
                                                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                                }`}
                                                        >
                                                            {lang.name}
                                                            {language === lang.id && <Check size={12} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleRunCode}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20"
                                    >
                                        <Play size={14} fill="currentColor" />
                                        RUN CODE
                                    </button>
                                </div>
                                <div className="flex-1 relative group flex bg-[#0d1117] font-mono text-sm leading-relaxed overflow-hidden">
                                    {/* Line Numbers Gutter */}
                                    <div
                                        ref={gutterRef}
                                        className="w-12 bg-[#0d1117] border-r border-[#30363d] text-[#484f58] text-right pr-3 pt-5 select-none overflow-hidden"
                                        style={{ fontFamily: '"Fira Code", monospace', lineHeight: '1.6' }}
                                    >
                                        {codeSnippet.split('\n').map((_, i) => (
                                            <div key={i}>{i + 1}</div>
                                        ))}
                                    </div>

                                    {/* Code Editor */}
                                    <textarea
                                        ref={editorRef}
                                        spellCheck={false}
                                        className="flex-1 w-full h-full bg-transparent text-[#e6edf3] p-5 outline-none resize-none leading-relaxed overflow-auto no-scrollbar whitespace-pre"
                                        placeholder="// write some code here..."
                                        value={codeSnippet}
                                        onChange={(e) => setCodeSnippet(e.target.value)}
                                        onScroll={(e) => {
                                            if (gutterRef.current) {
                                                gutterRef.current.scrollTop = e.target.scrollTop;
                                            }
                                        }}
                                        style={{ fontFamily: '"Fira Code", monospace', lineHeight: '1.6' }}
                                    />

                                    <div className="absolute bottom-4 right-4 text-[10px] text-gray-600 font-mono pointer-events-none select-none opacity-50">
                                        UTF-8 | {language === 'javascript' ? 'JavaScript' : language === 'c++' ? 'C++' : language.charAt(0).toUpperCase() + language.slice(1)}
                                    </div>
                                </div>
                            </div>


                        </div>

                    )}

                </div>
            </main>
        </div >
    );
};

export default Note;
