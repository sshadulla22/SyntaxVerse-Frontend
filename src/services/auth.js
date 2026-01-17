const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const authService = {
    login: async (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        return data;
    },

    signup: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Signup failed');
        }

        return response.json();
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    getCurrentUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            return null;
        }

        return response.json();
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

export default authService;
