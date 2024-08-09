import './Message.scss'
import HeaderPop from "./content/HeaderPop";
import MessageContent from "./content/MessgeContent";
import SendMessage from "./content/SendMessage";
import './Message.scss'


export function Message({conversationDetails, user}) {
    return (
        <div className="Message">
            <HeaderPop conversationDetails={conversationDetails} user={user}/>
            <MessageContent conversationDetails={conversationDetails} user={user}/>
            <SendMessage conversationDetails={conversationDetails} user={user}/>
        </div>
    )
}
export default Message;