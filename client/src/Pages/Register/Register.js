import React, { useState } from "react";
import axios from "axios";
import './Register.scss';

export function Register() {
    const [nameAndFirstName, setNameAndFirstName] = useState('');
    const [jeSuis, setJeSuis] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:8002/user/register', {
                email,
                nameAndFirstName,
                jeSuis,
                password
            });

            setSuccess(response.data.message);
            setError('');
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.');
            setSuccess('');
        }
    };

    return (
        <div className="Register">
            <form onSubmit={handleSubmit}>
                <div className='content-test-mail'>
                    <label>Mon nom et prénom</label>
                    <input
                        className="inputElement input-test-email"
                        placeholder="Je m'appelle.."
                        value={nameAndFirstName}
                        onChange={(e) => setNameAndFirstName(e.target.value)}
                    />
                </div>
                <div className='content-test-mail'>
                    <label>Mon poste</label>
                    <select
                        className="inputElement input-test-email slectedElement"
                        value={jeSuis}
                        onChange={(e) => setJeSuis(e.target.value)}
                    >
                        <option value="">Sélectionner un poste</option>
                        <option value="Chef de projet">Chef de projet</option>
                        <option value="Ux-designer">Ux-designer</option>
                        <option value="Ui-designer">Ui-designer</option>
                        <option value="Développeur">Développeur</option>
                        <option value="Département marketing">Département marketing</option>
                        <option value="Département communication">Département communication</option>
                        <option value="Client">Client</option>
                    </select>
                </div>
                <div className='content-test-mail'>
                    <label>Adresse e-mail</label>
                    <input
                        className="inputElement input-test-email"
                        placeholder="Tape ton adresse e-mail..."
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className='content-test-mail'>
                    <label>Mot de passe</label>
                    <input
                        className="inputElement input-test-email"
                        placeholder="Tape ton mot de passe..."
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button className="button btnElement" type="submit">
                    Finaliser l'inscription
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
        </div>
    );
}

export default Register;
