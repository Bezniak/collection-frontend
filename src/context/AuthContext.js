import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const jwt = Cookies.get('JWT');
        const userCookie = Cookies.get('me');
        if (jwt && userCookie) {
            try {
                setUser(JSON.parse(decodeURIComponent(userCookie)));
            } catch (error) {
                console.error('Failed to parse user cookie:', error);
            }
        }
    }, []);

    const login = (userData) => {
        Cookies.set('JWT', userData.jwt, { expires: 30 });
        Cookies.set('me', JSON.stringify(userData.user), { expires: 30 });
        setUser(userData.user);
    };

    const logout = () => {
        Cookies.remove('JWT');
        Cookies.remove('me');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
