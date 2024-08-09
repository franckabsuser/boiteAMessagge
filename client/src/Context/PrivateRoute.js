import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function PrivateRoute({ children }) {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/');
        }
    }, [isLoading, user, navigate]);

    if (isLoading) {
        return <div><h1>Chargement en cours...</h1></div>;
    }

    return user ? children : null;
}

export default PrivateRoute;
