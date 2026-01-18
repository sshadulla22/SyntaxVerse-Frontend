import React, { useState, useEffect } from "react";
import GlobalHeader from "./Navigation/GlobalHeader";
import { useNavigate, useParams } from "react-router-dom";
import {
  Folder as FolderIcon,
  FileText,
  ChevronRight,
  Home,
  PlusCircle,
  Trash2,
  Search,
  Edit2,
  Check,
  X,
  MoreVertical
} from "lucide-react";
import api from "../services/api";

const Notes = () => {
  const navigate = useNavigate();
  const { folderId } = useParams();
  const [currentFolder, setCurrentFolder] = useState(folderId ? parseInt(folderId) : null);
  const [notes, setNotes] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, title: "Home" }]);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const [loading, setLoading] = useState(true);

  // Initialize breadcrumbs if folderId is present
  useEffect(() => {
    if (folderId) {
      const id = parseInt(folderId);
      api.getNote(id).then((folder) => {
        setBreadcrumbs([
          { id: null, title: "Home" },
          { id: folder.id, title: folder.title },
        ]);
      });
    } else {
      setBreadcrumbs([{ id: null, title: "Home" }]);
      setCurrentFolder(null);
    }
  }, [folderId]);

  const loadNotes = React.useCallback(async () => {
    try {
      setLoading(true);
      let data;
      if (currentFolder === null) {
        data = await api.getRootNotes();
      } else {
        data = await api.getNoteChildren(currentFolder);
      }
      setNotes(data);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setLoading(false);
    }
  }, [currentFolder]);

  // Load notes when component mounts or folder changes
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreateItem = async (isFolder) => {
    if (!newItemTitle.trim()) return;

    try {
      const noteData = {
        title: newItemTitle,
        content: "",
        is_folder: isFolder,
        parent_id: currentFolder,
      };
      await api.createNote(noteData);
      setNewItemTitle("");
      loadNotes();
    } catch (error) {
      console.error("Error creating item:", error);
      alert("Failed to create item");
    }
  };

  const handleNoteClick = (note) => {
    if (note.is_folder) {
      setCurrentFolder(note.id);
      setBreadcrumbs([...breadcrumbs, { id: note.id, title: note.title }]);
      navigate(`/notes/${note.id}`);
    } else {
      navigate(`/note/${note.id}`);
    }
  };

  const handleBreadcrumbClick = (index) => {
    const crumb = breadcrumbs[index];
    setCurrentFolder(crumb.id);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    if (crumb.id) {
      navigate(`/notes/${crumb.id}`);
    } else {
      navigate("/");
    }
  };

  const handleDelete = async (noteId, e) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await api.deleteNote(noteId);
        loadNotes();
        // If we deleted the current folder, navigate up
        if (noteId === currentFolder) {
          handleBreadcrumbClick(breadcrumbs.length - 2);
        }
      } catch (error) {
        console.error("Error deleting note:", error);
        alert("Failed to delete item");
      }
    }
  };

  const handleEditClick = (note, e) => {
    e.stopPropagation();
    setEditingId(note.id);
    setEditTitle(note.title);
  };

  const handleRename = async (noteId, e) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    try {
      await api.updateNote(noteId, { title: editTitle });
      setEditingId(null);
      loadNotes();
      // If we renamed the current folder, update breadcrumbs
      if (noteId === currentFolder) {
        const newBreadcrumbs = [...breadcrumbs];
        newBreadcrumbs[newBreadcrumbs.length - 1].title = editTitle;
        setBreadcrumbs(newBreadcrumbs);
      }
    } catch (error) {
      console.error("Error renaming item:", error);
      alert("Failed to rename item");
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex flex-col font-sans">
      <GlobalHeader />

      <main className="flex-1 mt-16 p-4 md:p-8 w-full flex flex-col gap-6">

        {/* Navigation & Breadcrumbs Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black border border-[#333333] p-4 rounded-2xl shadow-xl">
          <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${index === breadcrumbs.length - 1
                    ? "text-blue-400 bg-blue-400/10 cursor-default"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {index === 0 ? <Home size={16} /> : null}
                  {crumb.title}
                </button>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight size={16} className="text-gray-600 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {currentFolder && (
              <div className="flex items-center gap-2 mr-2 border-r border-[#333333] pr-4">
                <button
                  onClick={(e) => {
                    const folder = breadcrumbs[breadcrumbs.length - 1];
                    handleEditClick({ id: folder.id, title: folder.title }, e);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-500/10"
                  title="Rename Current Folder"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={(e) => handleDelete(currentFolder, e)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                  title="Delete Current Folder"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input
                className="pl-9 pr-4 py-2 bg-black border border-[#333333] rounded-xl text-sm text-white focus:border-blue-500 outline-none transition-all w-full md:w-64"
                placeholder="Find in this folder..."
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreateItem(false)}
              />
            </div>
            <button
              onClick={() => handleCreateItem(true)}
              className="p-2 bg-green-600/20 text-green-500 border border-green-500/30 rounded-xl hover:bg-green-600 hover:text-white transition-all flex items-center gap-2"
              title="New Folder"
            >
              <FolderIcon size={20} />
              <span className="hidden sm:inline text-sm font-semibold">Folder</span>
            </button>
            <button
              onClick={() => handleCreateItem(false)}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              title="New Note"
            >
              <PlusCircle size={20} />
              <span className="hidden sm:inline text-sm font-semibold">Note</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1  border border-[#333333] rounded-3xl p-2 shadow-2xl overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 font-medium">Syncing files...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
              <div className="bg-[#1a1a1a] p-8 rounded-full border border-[#333333] mb-4">
                <FileText size={64} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-300">Folder is empty</h3>
              <p className="text-gray-500 mt-2 max-w-xs mx-auto">
                Organize your knowledge by adding notes or subfolders above.
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto no-scrollbar pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleNoteClick(note)}
                    className="group relative bg-black/40 hover:bg-[#1a1a1a] border border-[#333333] hover:border-blue-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl border ${note.is_folder
                        ? "bg-green-600/20 border-green-500/30 text-green-500"
                        : "bg-blue-600/20 border-blue-500/30 text-blue-500"
                        }`}>
                        {note.is_folder ? <FolderIcon size={20} /> : <FileText size={20} />}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => handleEditClick(note, e)}
                          className="p-1 text-gray-600 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-500/10 opacity-0 group-hover:opacity-100"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(note.id, e)}
                          className="p-1 text-gray-600 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div>
                      {editingId === note.id ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            autoFocus
                            className="bg-[#1a1a1a] border border-blue-500/50 rounded px-2 py-1 text-sm text-white outline-none w-full"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleRename(note.id, e)}
                          />
                          <button onClick={(e) => handleRename(note.id, e)} className="text-green-500 hover:text-green-400">
                            <Check size={16} />
                          </button>
                          <button onClick={handleCancelEdit} className="text-gray-500 hover:text-white">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <h4 className="text-white font-bold group-hover:text-blue-400 transition-colors truncate">
                          {note.title}
                        </h4>
                      )}
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          {note.is_folder ? "Folder" : "Note"}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notes;

