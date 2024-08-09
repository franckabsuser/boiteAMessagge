import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';  // Assurez-vous qu'axios est importé

import './Dashboard.scss';

import Navbar from "./components/Navbar";
import ContainerRight from "./components/ContainerRight";

export function Dashboard() {
    const { user, token } = useAuth();
    const { conversationId } = useParams();
    const [conversationDetails, setConversationDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [socket, setSocket] = useState(null);
    const [status, setStatus] = useState('Disconnected');


    const ws = useRef(null);

    useEffect(() => {
        const fetchConversationDetails = async () => {
            if (!conversationId) {
                setError('ID de la conversation non spécifié');
                setLoading(false);
                return;
            }

            if (!token) {
                setError('Token non disponible');
                setLoading(false);
                return;
            }

            try {
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };

                const response = await axios.get(`http://localhost:8002/conv/conversations/${conversationId}`, config);
                setConversationDetails(response.data);
                setError('');  // Effacer les erreurs précédentes
            } catch (error) {
                console.error('Erreur lors de la récupération des détails de la conversation:', error);
                setError('Erreur lors de la récupération des détails de la conversation. Veuillez réessayer.');
            } finally {
                setLoading(false);
            }
        };

        fetchConversationDetails();
    }, [conversationId, token]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8002/');

        ws.onopen = () => {
            setStatus('Connected');
            console.log('WebSocket connection established');
        };

        ws.onclose = () => {
            setStatus('Disconnected');
            console.log('WebSocket connection closed');
        };

        ws.onerror = (error) => {
            setStatus('Error');
            console.error('WebSocket error:', error);
        };

        setSocket(ws);

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    return (
        <div className='Dashboard'>
             <Navbar user={user} status={status} />
             <ContainerRight
                user={user}
                conversationDetails={conversationDetails}
                status={status} // Passer les utilisateurs en ligne à ContainerRight
            />
        </div>
    );
}

export default Dashboard;
