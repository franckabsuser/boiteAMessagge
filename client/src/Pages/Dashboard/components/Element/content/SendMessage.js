import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client'; // Importer Socket.io
import '../Message.scss';
import FileSend from '../../../../../assets/picto/filesSend.svg';
import SendFile from '../../../../../assets/picto/send.svg';
import Files from '../../../../../assets/picto/files.svg';
import Jpg from '../../../../../assets/picto/jpg.svg';
import { useAuth } from '../../../../../Context/AuthContext';

export function SendMessage({ conversationDetails, user: propUser }) {
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const { token, user } = useAuth(); // Assurez-vous que `user` est disponible via `useAuth`
    const [socket, setSocket] = useState(null); // État pour stocker la connexion Socket.io



    // Extraire uniquement les ID des participants
    const receiverIds = conversationDetails.participants
        .filter(p => p._id !== user._id)
        .map(p => p._id);

    const toggleVisibility = () => {
        setIsVisible(prevState => !prevState);
    };

    const sendMessage = async (type, content) => {
        try {
            const response = await axios.post(`http://localhost:8002/messages/text`, {
                sender: user._id,
                receiver: receiverIds, // Envoyer uniquement les IDs
                content,
                conversationId: conversationDetails._id
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} envoyé:`, response.data);
            setMessage('');
            setFile(null);

        } catch (error) {
            console.error(`Erreur lors de l'envoi du ${type}:`, error);
        }
    };

    const handleSendText = (e) => {
        e.preventDefault();
        if (message.trim()) {
            sendMessage('text', message);
        }
    };

    const handleSendFile = async (file) => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('sender', user._id);
            formData.append('receiver', JSON.stringify(receiverIds)); // Convertir les IDs en JSON
            formData.append('conversationId', conversationDetails._id);

            try {
                const response = await axios.post('http://localhost:8002/messages/file', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                console.log('Fichier envoyé:', response.data);

                // Émettre le fichier via Socket.io
            } catch (error) {
                console.error('Erreur lors de l\'envoi du fichier:', error);
            }
        }
    };

    return (
        <div className="SendMessage">
            <form onSubmit={handleSendText}>
                <div className="sent-type">
                    <button className="import" type="button" onClick={toggleVisibility}>
                        <img src={FileSend} alt="Importer"/>
                    </button>
                    {isVisible && (
                        <div className="sen-tupe-element">
                            <label>
                                <button type="button">
                                    <img src={Jpg} alt="Envoyer une image"/>Envoyer une image
                                </button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        setFile(file);
                                        if (file) {
                                            sendMessage('image', URL.createObjectURL(file));
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            <label>
                                <button type="button">
                                    <img src={Files} alt="Envoyer un fichier"/>Envoyer un fichier
                                </button>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        setFile(file);
                                        if (file) {
                                            handleSendFile(file);
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                    )}
                </div>
                <input
                    type="text"
                    placeholder='Écrire un message...'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button className="sendText" type="submit">
                    <img src={SendFile} alt="Envoyer"/>
                </button>
            </form>
        </div>
    );
}

export default SendMessage;
