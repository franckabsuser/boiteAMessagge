import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Création du contexte d'authentification
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();



    // Récupération des détails utilisateur
    const fetchUserDetails = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8002/user/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
            handleLogout();
        } finally {
            setIsLoading(false);
        }
    };

    // Déconnexion
    const handleLogout = () => {
        setUser(null);
        setToken(null);
        setUserId(null);
        localStorage.removeItem('token');
        navigate('/');
    };

    // Décodage du token JWT
    function decodeJwt(token) {
        const base64Url = token.split('.')[1];
        if (!base64Url) {
            throw new Error('Invalid token format');
        }

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    }

    // Effet d'initialisation pour vérifier le token stocké
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decodedToken = decodeJwt(storedToken);
                setToken(storedToken);
                setUserId(decodedToken.userId);
                fetchUserDetails(decodedToken.userId);
            } catch (error) {
                console.error('Invalid token', error);
                handleLogout();
            }
        } else {
            setUser(null);
            setIsLoading(false);
        }
    }, []);

    // Connexion de l'utilisateur
    const login = async (newToken) => {
        try {
            const decodedToken = decodeJwt(newToken);
            setToken(newToken);
            setUserId(decodedToken.userId);
            await fetchUserDetails(decodedToken.userId);
            localStorage.setItem('token', newToken);
            navigate(`/boiteAMessage`);
        } catch (error) {
            console.error('Invalid token', error);
        }
    };

    // Valeurs du contexte
    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout: handleLogout, token, userId, socket }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook pour utiliser le contexte
export const useAuth = () => useContext(AuthContext);
