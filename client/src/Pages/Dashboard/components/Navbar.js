import React, { useState, useEffect, useCallback } from 'react';
import './Navbar.scss';
import Loop from '../../../assets/picto/SolarMinimalisticMagniferLinear.svg';
import MessageSend from '../../../assets/picto/messageSend.svg';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ModalConversation from "../Modals/ModalConversation";
import { useAuth } from '../../../Context/AuthContext';

// Composant Navbar
export function Navbar({ user, status }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [unreadMessages, setUnreadMessages] = useState([]);
    const { token } = useAuth();
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await axios.get('http://localhost:8002/conv/conversations', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setConversations(response.data);

                const unreadMessagesPromises = response.data.map(convo =>
                    axios.get(`http://localhost:8002/messages/${convo._id}/unread`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }).then(res => res.data)
                );
                const unreadMessagesResults = await Promise.all(unreadMessagesPromises);
                setUnreadMessages(unreadMessagesResults.flat());
            } catch (err) {
                console.error('Erreur lors de la récupération des conversations:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [token]);


    const markMessagesAsRead = useCallback(async (conversationId) => {
        try {
            if (!conversationId) {
                console.error('ID de la conversation non défini');
                return;
            }

            const messagesToMark = unreadMessages.filter(msg =>
                msg.conversation && msg.conversation._id === conversationId &&
                msg._id
            );

            if (messagesToMark.length === 0) {
                console.log('Aucun message à marquer comme lu');
                return;
            }

            await Promise.all(messagesToMark.map(message =>
                axios.put(`http://localhost:8002/messages/${message._id}/read-status`, {
                    isRead: true
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            ));

            setUnreadMessages(prevMessages => prevMessages.filter(msg => !messagesToMark.includes(msg)));

            // Notify other clients via WebSocket (if applicable)


        } catch (err) {
            console.error('Échec de la mise à jour du statut de lecture', err);
        }
    }, [unreadMessages, token]);

    const handleConversationClick = (id) => {
        if (selectedConversationId === id) {
            console.log(`Conversation ${id} fermée`);
            setSelectedConversationId(null);
        } else {
            console.log(`Conversation ${id} ouverte`);
            setSelectedConversationId(id);
            markMessagesAsRead(id);
        }
    };

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    return (
        <div className="Navbar">
            <header>
                <div className="image-user"></div>
                <div className="content-element-user">
                    <h3>{user.nameAndFirstName}</h3>
                    <p>@{user.email}</p>
                    {status}
                </div>
            </header>

            <div className="content-search">
                <div className="element">
                    <img src={Loop} alt="Search Icon" />
                    <input type='text' placeholder="Search..." />
                </div>
            </div>

            <div className="sectionElementMessage">
                <div className="filterElement">
                    EEEE
                </div>

                <ul>
                    {loading ? (
                        <li>Loading conversations...</li>
                    ) : conversations.length > 0 ? (
                        conversations.map(convo => {
                            const otherParticipants = convo.participants.filter(p => p._id !== user._id);
                            const isActive = selectedConversationId === convo._id;
                            const unreadCount = unreadMessages.filter(msg =>
                                msg.conversation && msg.conversation._id === convo._id &&
                                msg.sender._id !== user._id
                            ).length;
                            return (
                                <li
                                    className={`elementLi-content ${isActive ? 'active' : ''}`}
                                    key={convo._id}
                                    onClick={() => handleConversationClick(convo._id)}
                                >
                                    <Link className="linkContent" to={`/boiteAMessage/${convo._id}`}>
                                        <div className="element-Avatar"></div>
                                        <div className="elementDisc">
                                            {otherParticipants.length > 0 ? (
                                                <>
                                                    {otherParticipants.map(p => (
                                                        <React.Fragment key={p._id}>
                                                            <span className="name">{p.nameAndFirstName}</span>
                                                            <p>Online Or Offline</p>
                                                        </React.Fragment>
                                                    ))}
                                                </>
                                            ) : 'No other participants'}
                                            <p className="content">
                                                {convo.lastMessage ? convo.lastMessage.content : 'No messages'}
                                            </p>
                                        </div>
                                        <div className="eleTime">
                                            <p className="timeSend">15:33</p>
                                            <div className="notif">
                                                {unreadCount}
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })
                    ) : (
                        <li>No conversations found</li>
                    )}
                </ul>
            </div>

            <div className="userElementAction">
                <button onClick={handleOpenModal}><img src={MessageSend} alt="Send Message"/></button>
                <button>1</button>
                <button>1</button>
            </div>

            {isModalOpen && (
                <ModalConversation onClose={handleCloseModal}/>
            )}
        </div>
    );
}

export default Navbar;
