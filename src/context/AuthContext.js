import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from "../components/utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [theme, setTheme] = useState(Cookies.get('theme') || 'light');

    useEffect(() => {
        const jwt = Cookies.get('JWT');
        const userCookie = Cookies.get('me');
        if (jwt && userCookie) {
            try {
                const parsedUser = JSON.parse(decodeURIComponent(userCookie));
                setUser(parsedUser);
                if (parsedUser.role && parsedUser.role.type) {
                    setRole(parsedUser.role.type);
                } else {
                    // Fetch user role if not present in cookie
                    fetchUserRole();
                }
            } catch (error) {
                console.error('Failed to parse user cookie:', error);
            }
        }
    }, []);

    useEffect(() => {
        document.body.className = theme;
        Cookies.set('theme', theme, { expires: 365 });
    }, [theme]);

    const fetchUserRole = async () => {
        try {
            const res = await api.get(`/users/me?populate=*`);
            if (res.role && res.role.type) {
                setRole(res.role.type);
                // Update cookie with the role
                Cookies.set('me', JSON.stringify(res), { expires: 30 });
                setUser(res);
            }
        } catch (error) {
            console.error('Failed to fetch user role:', error);
        }
    };

    const login = async (userData) => {
        try {
            Cookies.set('JWT', userData.jwt, { expires: 30 });
            // Fetch full user data with role
            const res = await api.get(`/users/me?populate=*`);
            if (res?.role?.type) {
                setRole(res.role.type);
                userData.user.role = res.role; // Ensure role is included in userData
            }
            Cookies.set('me', JSON.stringify(userData.user), { expires: 30 });
            setUser(userData.user);
        } catch (error) {
            console.error('Failed to fetch user role during login:', error);
        }
    };

    const logout = () => {
        Cookies.remove('JWT');
        Cookies.remove('me');
        setUser(null);
        setRole(null);
    };

    const updateRole = (newRole) => {
        setRole(newRole);
        if (user) {
            const updatedUser = { ...user, role: { ...user.role, type: newRole } };
            setUser(updatedUser);
            Cookies.set('me', JSON.stringify(updatedUser), { expires: 30 });
        }
    };

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <AuthContext.Provider value={{ user, role, login, logout, updateRole, theme, toggleTheme }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
