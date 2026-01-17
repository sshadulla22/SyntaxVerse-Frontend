const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const fetchWithTimeout = async (url, options = {}) => {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    // Auth Header Injection
    const token = localStorage.getItem('token');
    const headers = {
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal
        });
        clearTimeout(id);

        if (response.status === 401) {
            localStorage.removeItem('token');
            // Force a reload or window event to let App know we are logged out
            window.dispatchEvent(new Event('storage'));
        }

        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

const api = {
    getRootNotes: async () => {
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}/notes/`);
            if (!response.ok) return [];
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("API Error (getRootNotes):", error);
            return [];
        }
    },

    getNote: async (id) => {
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}/notes/${id}`);
            if (!response.ok) throw new Error('Note not found');
            return response.json();
        } catch (error) {
            console.error("API Error (getNote):", error);
            throw error;
        }
    },

    getNoteChildren: async (id) => {
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}/notes/${id}/children`);
            if (!response.ok) return [];
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("API Error (getNoteChildren):", error);
            return [];
        }
    },

    createNote: async (noteData) => {
        const response = await fetchWithTimeout(`${API_BASE_URL}/notes/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData),
        });
        if (!response.ok) throw new Error('Failed to create note');
        return response.json();
    },

    updateNote: async (id, noteData) => {
        const response = await fetchWithTimeout(`${API_BASE_URL}/notes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData),
        });
        if (!response.ok) throw new Error('Failed to update note');
        return response.json();
    },

    deleteNote: async (id) => {
        const response = await fetchWithTimeout(`${API_BASE_URL}/notes/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete note');
        return response.json();
    },

    searchNotes: async (query) => {
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}/notes/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) return [];
            return response.json();
        } catch (error) {
            console.error("API Error (searchNotes):", error);
            return [];
        }
    },

    executeCode: async (language, source) => {
        try {
            const payload = {
                language: language,
                version: "*",
                files: [{ content: source }]
            };
            const response = await fetchWithTimeout(`${API_BASE_URL}/notes/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Execution failed');
            }
            return response.json();
        } catch (error) {
            console.error("API Error (executeCode):", error);
            throw error;
        }
    },

    getHealth: async () => {
        const start = Date.now();
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}/`, { timeout: 3000 });
            const latency = Date.now() - start;
            return {
                ok: response.ok,
                status: response.status,
                latency: latency,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                ok: false,
                status: 'ERR',
                latency: Date.now() - start,
                timestamp: new Date().toISOString()
            };
        }
    }
};

export default api;
