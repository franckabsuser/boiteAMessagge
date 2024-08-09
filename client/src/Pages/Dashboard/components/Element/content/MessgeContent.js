import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../../Context/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import '../Message.scss';
import Check from '../../../../../assets/picto/checkElement.svg';

export function MessageContent({ conversationDetails }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, user: authUser } = useAuth();
    const conversationId = conversationDetails?._id; // Safe navigation with optional chaining

    useEffect(() => {
        const fetchMessages = async () => {
            if (!conversationId) {
                setError('Conversation ID is missing.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:8002/messages/${conversationId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setMessages(response.data);
            } catch (err) {
                setError(err.message || 'An error occurred while fetching messages.');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [conversationId, token]);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8002`);

        ws.onopen = () => {
            console.log('WebSocket connected');
            ws.send(JSON.stringify({ type: 'JOIN_CONVERSATION', conversationId, token }));
        };

        ws.onmessage = (event) => {
            const { type, message } = JSON.parse(event.data);
            if (type === 'NEW_MESSAGE') {
                setMessages(prevMessages => [...prevMessages, message]);
            }
        };

        return () => {
            ws.close();
        };
    }, [conversationId, token]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="MessageContent">
            {messages.length === 0 ? (
                <div>No messages found.</div>
            ) : (
                messages.map((message) => (
                    <div key={message._id} className={`message ${message.sender._id === authUser._id ? 'sent' : 'received'}`}>
                        <div className="contentDisplay">
                            <div className="elementContent">
                                <div className='messageElement'>
                                    <p>{message.content}</p>
                                    <div className={`isRead ${message.isRead ? 'read' : 'unread'}`}>
                                        <img src={Check} alt="Read Status" />
                                    </div>
                                </div>
                                <div className="element-user">
                                    <p className="time">
                                        {format(new Date(message.createdAt), ' HH:mm', { locale: fr })}
                                    </p>
                                    <div className="boule"></div>
                                    <div className="sender">{message.sender.nameAndFirstName}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default MessageContent;
