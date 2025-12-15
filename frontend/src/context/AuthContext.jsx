import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await api.get('/auth/profile/');
                    setUser(response.data);
                } catch (error) {
                    // Token invalid or expired and refresh failed
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login/', { email, password });
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        // Fetch user profile immediately
        const profile = await api.get('/auth/profile/');
        setUser(profile.data);
        return true;
    };

    const register = async (username, email, password, password2) => {
        console.log("AuthContext: Registering user", { username, email });
        try {
            const response = await api.post('/auth/register/', { username, email, password, password2 });
            console.log("AuthContext: Registration successful", response.data);
            return true;
        } catch (error) {
            console.error("AuthContext: Registration failed", error.response?.data || error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout/');
        } catch (e) {
            console.error(e);
        }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
