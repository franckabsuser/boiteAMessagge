import React, { useState, useEffect, useRef } from "react";
import axios from 'axios'; // Import axios
import { useAuth } from '../../../Context/AuthContext';
import Loop from "../../../assets/picto/SolarMinimalisticMagniferLinear.svg";
import Close from '../../../assets/picto/MaterialSymbolsCloseSmallRounded.svg';

export function ModalConversation({ onClose }) {
    const [emailInput, setEmailInput] = useState('');
    const [error, setError] = useState('');
    const { token, user } = useAuth();
    const [conversationName, setConversationName] = useState('');
    const ws = useRef(null);  // Utilisation d'une référence pour la connexion WebSocket

    useEffect(() => {
        // Connexion WebSocket
        ws.current = new WebSocket('ws://localhost:8002/'); // Utilisation du protocole ws://

        ws.current.onopen = () => {
            console.log('Connexion WebSocket établie');
            if (user?._id) {
                ws.current.send(JSON.stringify({
                    type: 'registerUser',
                    userId: user._id,
                }));
            }
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'receiveMessage') {
                console.log('Message reçu:', data.message);
                // Gérez la logique pour les nouveaux messages ici
            } else if (data.type === 'updateReactions') {
                console.log('Réactions mises à jour:', data.message);
                // Gérez les mises à jour des réactions ici
            }
        };

        ws.current.onclose = () => {
            console.log('Connexion WebSocket fermée');
        };

        return () => {
            if (ws.current.readyState === WebSocket.OPEN) { // <-- Vérifier si la connexion est ouverte
                ws.current.close();
            }
        };
    }, [user?._id]);

    const handleInputChange = (event) => {
        setEmailInput(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const participants = emailInput.split(',')
            .map(email => email.trim())
            .filter(email => email !== '');

        if (participants.length < 1) {
            setError('Veuillez entrer au moins une adresse email pour créer une conversation.');
            return;
        }

        if (user && !participants.includes(user.email)) {
            participants.push(user.email);
        }

        const conversationData = {
            participants,
            ...(participants.length > 1 && conversationName && { name: conversationName })
        };

        try {
            const response = await axios.post('http://localhost:8002/conv/conversations', conversationData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 201) {
                // Émettre un événement pour informer les autres clients de la nouvelle conversation
                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify({
                        type: 'newConversation',
                        conversation: response.data
                    }));
                }
                onClose();
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Une erreur est survenue lors de la création de la conversation.');
            }
        }
    };

    return (
        <div className="ModalConversation">
            <section>
                <div className="elementHeader">
                    <h2>Créer une nouvelle conversation</h2>
                    <button onClick={onClose} className="close-button">
                        <img src={Close} alt="Close"/>
                    </button>
                </div>

                <div className="formElement">
                    <div className="element">
                        <img src={Loop} alt="Search Icon"/>
                        <input
                            type='text'
                            placeholder="Enter email(s)..."
                            value={emailInput}
                            onChange={handleInputChange}
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                </div>
                <button
                    className="button-conv"
                    onClick={handleSubmit}
                >
                    Créer
                </button>
            </section>
        </div>
    );
}

export default ModalConversation;
