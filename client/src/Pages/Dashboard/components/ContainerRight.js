import React from 'react';
import './ContainerRight.scss';

import Dot from '../../../assets/picto/MdiDotsVertical.svg'
import Message from "./Element/Message";

function ContainerRight({ conversationDetails, user }) {
    // Vérifier si les détails de la conversation sont disponibles
    if (!conversationDetails) {
        return <div className="ContainerRight">Loading...</div>;
    }

    // Vérifier si l'utilisateur est défini
    if (!user) {
        return <div className="ContainerRight">User not found</div>;
    }

    // Filtrer les participants en excluant l'utilisateur actuel
    const otherParticipants = conversationDetails.participants.filter(p => p._id !== user._id);

    return (
        <div className="ContainerRight">
            <header>
                <div className="containeLeft">
                    <div className="avatarUser"></div>
                    <div className="elementDisc">
                        <p>
                            {otherParticipants.length > 0 ? (
                                otherParticipants.map(p => (
                                    <span className="name" key={p._id}>{p.nameAndFirstName}</span>
                                ))
                            ) : (
                                'No other participants'
                            )}
                        </p>
                        <div>
                            <div className="buble">
                                <div className="element"></div>
                                <p>En ligne</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="contentRight">
                        <div>
                            <button>
                                <img src={Dot} />
                            </button>
                        </div>
                </div>

            </header>
           <Message conversationDetails={conversationDetails} user={user}/>
        </div>
    );
}

export default ContainerRight;
