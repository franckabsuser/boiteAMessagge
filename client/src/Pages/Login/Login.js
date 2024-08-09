import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext'; // Ensure this path is correct
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8002/user/login', { email, password });
            if (response.data.token) {
                Cookies.set('token', response.data.token, { expires: 365, path: '/' });
                login(response.data.token);
                navigate(`/boiteAMessage`);
            } else {
                toast.error('Token non reçu du serveur');
            }
        } catch (error) {
            // Vérifiez si l'erreur est due à une requête préliminaire CORS
            if (error.response) {
                if (error.response.status === 400) {
                    toast.error("Oups.. Le mot de passe et l'email ne correspondent pas");
                } else if (error.response.status === 401) {
                    toast.error("Identifiants incorrects");
                } else {
                    toast.error(`Erreur lors de la connexion: ${error.response.statusText}`);
                }
            } else if (error.request) {
                toast.error('Erreur de réseau, veuillez vérifier votre connexion.');
            } else {
                toast.error('Erreur lors de la demande: ' + error.message);
            }
        }
    };



    return (
        <div className="Login">
            <form onSubmit={handleSubmit}>
                <div className='content-test-mail'>
                    <label htmlFor="email">E-mail</label>
                    <input
                        id="email"
                        className="inputElement input-test-email"
                        placeholder="Tape ton adresse e-mail..."
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className='content-test-mail content-test-mail-2'>
                    <label htmlFor="password">Mot de passe</label>
                    <input
                        id="password"
                        className="inputElement input-test-email"
                        placeholder="Tape ton mot de passe..."
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className="button btnElement" type="submit">
                    Se connecter
                </button>
            </form>
        </div>
    );
}

export default Login;
