import React, { useState } from 'react';
import axios from 'axios';
import './HomePage.scss';
import Login from './Login/Login';
import Register from './Register/Register';

export function HomePage() {
    const [email, setEmail] = useState('');
    const [userExists, setUserExists] = useState(null);
    const [error, setError] = useState('');
    const [buttonClicked, setButtonClicked] = useState(false); // Nouvel état pour suivre le clic du bouton

    // Fonction pour vérifier si l'utilisateur existe en appelant l'API avec axios
    const checkUserExists = async (email) => {
        try {
            const response = await axios.get(`http://localhost:8002/user/exists/${encodeURIComponent(email)}`);
            if (response.data && typeof response.data.exists === 'boolean') {
                return response.data.exists;
            }
            throw new Error('Réponse inattendue de l\'API');
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'utilisateur:', error);
            setError('Erreur lors de la vérification de l\'utilisateur. Veuillez réessayer.');
            return false; // En cas d'erreur, considérer que l'utilisateur n'existe pas
        }
    };

    const handleEmailChange = async (event) => {
        const newEmail = event.target.value;
        setEmail(newEmail);

        if (newEmail) {
            // Simple validation de l'email avant de faire la requête API
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailPattern.test(newEmail)) {
                // Ne pas vérifier l'existence immédiatement, seulement lors du clic sur le bouton
                setUserExists(null);
                setError(''); // Réinitialiser les erreurs si l'email est valide
            } else {
                setUserExists(null);
                setError('Adresse e-mail invalide');
            }
        } else {
            setUserExists(null);
            setError('');
        }
    };

    const handleButtonClick = async () => {
        if (email) {
            const exists = await checkUserExists(email);
            setUserExists(exists);
            setButtonClicked(true); // Mettre à jour l'état pour indiquer que le bouton a été cliqué
        }
    };

    const shouldShowButton = userExists === null;

    return (
        <div className='HomePage'>
            <h1>Hey 👋, Bienvenue sur ta boite à message</h1>
            <h2>Connectez-vous à votre compte Bam</h2>

            {userExists === null && (
                <div className='content-test-mail'>
                    <label>E-mail</label>
                    <input
                        className="inputElement input-test-email"
                        placeholder="Tapez votre adresse e-mail.."
                        value={email}
                        onChange={handleEmailChange}
                    />
                    {shouldShowButton && (
                        <button
                            className="button"
                            disabled={!!error || !email}
                            onClick={handleButtonClick}
                        >
                            Continuer
                        </button>
                    )}
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            {/* Afficher le composant seulement si le bouton a été cliqué */}
            {buttonClicked && (userExists ? <Login /> : <Register />)}
        </div>
    );
}

export default HomePage;
