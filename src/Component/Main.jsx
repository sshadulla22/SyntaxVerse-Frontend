import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Folder as FolderIcon, Clock, MoreVertical, Trash2, Edit2, Check, X } from "lucide-react";
import GlobalHeader from "./Navigation/GlobalHeader";
import api from "../services/api";
import authService from "../services/auth";

const Main = () => {
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [newTopicTitle, setNewTopicTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.5;
        }
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
        };
        fetchUser();
        loadTopics();
    }, []);

    const loadTopics = async () => {
        try {
            setLoading(true);
            console.log("Fetching topics from:", api.API_BASE_URL || "default");
            const data = await api.getRootNotes();
            console.log("Topics data received:", data);

            if (data && Array.isArray(data)) {
                const folders = data.filter((item) => item.is_folder);
                setTopics(folders);
            } else {
                console.warn("Received invalid topics data:", data);
                setTopics([]);
            }
        } catch (error) {
            console.error("Critical error loading topics:", error);
            setTopics([]);
        } finally {
            setLoading(false);
            console.log("Loading state finished.");
        }
    };

    const handleTopicClick = (topic) => {
        navigate(`/notes/${topic.id}`);
    };

    const handleCreateTopic = async () => {
        if (!newTopicTitle.trim()) return;

        try {
            await api.createNote({
                title: newTopicTitle,
                content: "",
                is_folder: true,
                parent_id: null,
            });
            setNewTopicTitle("");
            loadTopics();
        } catch (error) {
            console.error("Error creating topic:", error);
            alert("Failed to create topic");
        }
    };

    const handleDeleteTopic = async (topicId, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this topic and all its contents?")) {
            try {
                await api.deleteNote(topicId);
                loadTopics();
            } catch (error) {
                console.error("Error deleting topic:", error);
                alert("Failed to delete topic");
            }
        }
    };

    const handleEditClick = (topic, e) => {
        e.stopPropagation();
        setEditingId(topic.id);
        setEditTitle(topic.title);
    };

    const handleRenameTopic = async (topicId, e) => {
        e.stopPropagation();
        if (!editTitle.trim()) return;
        try {
            await api.updateNote(topicId, { title: editTitle });
            setEditingId(null);
            loadTopics();
        } catch (error) {
            console.error("Error renaming topic:", error);
            alert("Failed to rename topic");
        }
    };

    const handleCancelEdit = (e) => {
        e.stopPropagation();
        setEditingId(null);
    };

    const filteredTopics = topics.filter((topic) =>
        topic.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-transparent text-gray-100 flex flex-col font-sans">
            <GlobalHeader />

            <main className="flex-1 mt-16 p-2 md:p-10 flex flex-col gap-4 w-full transition-all duration-500">

                {/* Workspace Hero Section */}
                <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden group shadow-2xl ">
                    <video
                        ref={videoRef}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 contrast-110 brightness-90 saturate-125"
                    >
                        <source src="/videos/hero.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-6 left-8 md:bottom-10 md:left-12">
                        <div className="bg-blue-600/30 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 border border-blue-500/30 mb-3 w-fit font-display">
                            Knowledge Workspace
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">
                            Design your <span className="text-blue-500 italic">ideas.</span>
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm md:text-base font-medium max-w-md">
                            Welcome back, <span className="text-white font-bold">{user?.full_name || 'Innovator'}</span>! You have <span className="text-white font-bold">{topics.length}</span> active focus areas.
                        </p>
                    </div>
                </div>


                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar Section */}
                    <aside className="w-full md:w-80 flex flex-col gap-6">
                        <div className="bg-black border border-gray-900 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Search className="text-blue-500" size={20} />
                                Search Topics
                            </h2>

                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 bg-black border border-[#333333] rounded-xl text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Find a topic..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="h-[1px] bg-gray-800"></div>

                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Plus className="text-green-500" size={20} />
                                New Topic
                            </h2>

                            <div className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-black border border-[#333333] rounded-xl text-white text-sm focus:border-blue-500 outline-none transition-all"
                                    placeholder="Topic name (e.g. React)"
                                    value={newTopicTitle}
                                    onChange={(e) => setNewTopicTitle(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleCreateTopic()}
                                />
                                <button
                                    onClick={handleCreateTopic}
                                    className="w-full py-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all active:scale-[0.98] shadow-lg  flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    Create Topic
                                </button>
                            </div>
                        </div>

                        {/* Stats or Info Box */}
                        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-[#333333] rounded-2xl p-6 hidden md:block">
                            <p className="text-sm text-blue-300 font-medium italic">
                                "Organize your thoughts, one topic at a time."
                            </p>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="bg-black/50 p-3 rounded-lg border border-white/10">
                                    <FolderIcon size={24} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-white font-display">{topics.length}</p>
                                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest">Total Topics</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Topics Grid Section */}
                    <section className="flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Topics</h1>
                                <p className="text-gray-500 mt-1">Select a folder to manage your notes</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                                <p className="text-gray-400 font-medium">Loading your knowledge base...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredTopics.length === 0 ? (
                                    <div className="col-span-full bg-[#111111] border-2 border-dashed border-[#333333] rounded-3xl py-16 px-4 flex flex-col items-center justify-center text-center">
                                        <div className="bg-[#1a1a1a] p-6 rounded-full border border-[#333333] mb-4">
                                            <Search size={48} className="text-gray-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-300">No topics found</h3>
                                        <p className="text-gray-500 mt-2 max-w-sm">
                                            {searchTerm
                                                ? `We couldn't find anything matching "${searchTerm}"`
                                                : "You haven't created any topics yet. Start by adding one from the sidebar!"}
                                        </p>
                                    </div>
                                ) : (
                                    filteredTopics.map((topic) => (
                                        <div
                                            key={topic.id}
                                            onClick={() => handleTopicClick(topic)}
                                            className="group flex flex-row items-center gap-4 relative bg-black/40 hover:bg-black border border-gray-900 hover:border-blue-500/50 rounded-2xl p-1 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-blue-600/10 transition-colors"></div>

                                            <div className="bg-blue-600/20 p-3 rounded-xl border border-blue-500/30 group-hover:scale-110 transition-transform duration-300 relative z-10 shrink-0">
                                                <FolderIcon className="text-blue-500" size={24} />
                                            </div>

                                            <div className="flex-1 min-w-0 relative z-10">
                                                {editingId === topic.id ? (
                                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            autoFocus
                                                            className="bg-black border border-blue-500/50 rounded-lg px-3 py-1 text-sm text-white outline-none w-full"
                                                            value={editTitle}
                                                            onChange={(e) => setEditTitle(e.target.value)}
                                                            onKeyPress={(e) => e.key === "Enter" && handleRenameTopic(topic.id, e)}
                                                        />
                                                        <button onClick={(e) => handleRenameTopic(topic.id, e)} className="text-green-500 hover:text-green-400 p-1">
                                                            <Check size={18} />
                                                        </button>
                                                        <button onClick={handleCancelEdit} className="text-gray-500 hover:text-white p-1">
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate font-display">
                                                            {topic.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                                <Clock size={10} />
                                                                {new Date(topic.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </span>
                                                            <span className="text-[10px] text-blue-500/60 font-bold uppercase tracking-wider">
                                                                Folder
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 relative z-10 shrink-0">
                                                <button
                                                    className="text-gray-600 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-blue-500/10 opacity-0 group-hover:opacity-100"
                                                    onClick={(e) => handleEditClick(topic, e)}
                                                    title="Rename Topic"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="text-gray-600 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                                                    onClick={(e) => handleDeleteTopic(topic.id, e)}
                                                    title="Delete Topic"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Main;
