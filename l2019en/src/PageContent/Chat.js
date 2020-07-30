import React from 'react';
import ReactDOM from 'react-dom';
import { withRouter,Link } from 'react-router-dom';
import Pusher from 'pusher-js';
import axios from 'axios';
import { checkAuth, logout } from '../Components/Functions/Auth';
import { IconButton,Chip } from '@material-ui/core';
import { InputBase } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import './Chat.css';

class Chat extends React.Component {

    constructor(props)
    {
        super(props);
        this.pusher = new Pusher('<key>', {cluster: 'eu'});
        this.inputRef = React.createRef();
    }

    state= {
        me: this.props.type + this.props.id,
        partner: undefined,
        partnerJoined: false,
        linkToPartner: '',
        messages : []
    }

    _mounted = false;

    getMessages = () =>
    {
        const channel = this.pusher.subscribe('chat-' + this.props.location.state.chatChannel);
        channel.bind('addMessage', data => {
            if(this._mounted === true)
            {
                this.setState((prevState) => ({
                    messages: [...prevState.messages, data.message],
                }));
            }
        });
    }

    componentDidMount()
    {
        require('../PageContent/VanillaJS/chatbody.js');

        if(this.props.location.state !== undefined)
        {
            if(this.props.location.state.partner !== undefined)
            {
                this.setState((prevState) => ({
                    ...prevState,
                    partner: this.props.location.state.partner
                }))
            }

            if(this.props.location.state.linkToPartner !== undefined)
            {
                this.setState((prevState) => ({
                    ...prevState,
                    linkToPartner: this.props.location.state.linkToPartner
                }))
            }

            if(this.props.location.state.chatChannel !== undefined)
            {
                this.getMessages();
            }
        }
        else
        {
            this.props.history.push('/');
        }

        this._mounted = true;
    }

    componentWillUnmount()
    {
        this._mounted = false;
    }

    scrollBottom = () =>
    {
        let chatBody = document.getElementById("chatBody");
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    systemMessage = (type,message) =>
    {
        checkAuth().then((authorization) => {
            if(authorization.isValid)
            {
                let postData = {
                    request: "sendMessage",
                    message: {
                        author:"system",
                        type: type,
                        text: message,
                    },
                    channel: this.props.location.state.chatChannel,
                }

                axios.post("http://" + window.location.hostname + ":8000/chatFunctions.php",postData)
                .then(
                    (response) =>
                    {

                    }
                )

            }
            else
            {
                logout();
            }
        })
    }

    onEnter = (event) =>
    {
        if(event.key === "Enter")
        {
            this.sendMessage(event);
        }
    }

    sendMessage = (event) =>
    {
        checkAuth().then((authorization) => {
            if(authorization.isValid)
            {
                let inputValue = this.inputRef.current.firstChild.value;
                ReactDOM.findDOMNode(this.inputRef.current.firstChild).value = "";
                if(inputValue !== "")
                {
                    let postData = {
                        request: "sendMessage",
                        message: {
                            author:authorization.userdata.type + authorization.userdata.id,
                            text: inputValue,
                        },
                        channel: this.props.location.state.chatChannel,
                    }

                    axios.post("http://" + window.location.hostname + ":8000/chatFunctions.php",postData)
                    .then(
                        (response) =>
                        {

                        }
                    )
                }
            }
            else
            {
                logout();
            }
        })
    }

    renderMessage = (message,key) =>
    {
        if(message.author === "system")
        {
            if(message.type === "declineRequest")
            {
                return(
                    <div key ={key} className = {"system-message-left"}>
                        {this.state.partner + " has declined your chat request"}
                    </div>
                );
            }
            else if(message.type === "timeout")
            {
                return(
                    <div key ={key} className = {"system-message-left"}>
                        {"Connection to " + this.state.partner + " has timed out!"}
                    </div>
                );
            }
            else
            {
                return(
                    <div key ={key} className = {"system-message-" + message.type}>
                        {this.state.partner + " " + message.type}
                    </div>
                );
            }
        }
        else if(message.author === (this.props.type + this.props.id))
        {
            return(
                <div key ={key} className = "sent-message">
                    <Chip label={message.text} className="sent-color wrap-words" />
                </div>
            );
        }
        else
        {
            return(
                <div key ={key} className = "received-message">
                    <Chip label={message.text} className="wrap-words" />
                </div>
            );
        }
    }

    componentDidUpdate(nextProps,prevState)
    {
        if(prevState.messages !== this.state.messages)
        {
            this.scrollBottom();
        }
    }

    render()
    {
            return (
                <div className = "flex-fullWH-container justify-content-center flex-column overflow-none">
                    <div className = "chat-window">
                        <div className="chat-header">
                            <h5>Chatting with <Link to = {this.state.linkToPartner} target="_blank">{this.state.partner}</Link></h5>
                        </div>
                        <div id="chatBody" style = {{height: window.innerHeight - 275 + 'px'}} className="chat-body">
                            {
                                this.state.messages.map((message,key) =>
                                    this.renderMessage(message,key)
                                )
                            }

                        </div>
                    </div>
                    <div className="send-message-box">
                        <div className="message-box">
                            <InputBase
                                fullWidth
                                placeholder="type your message..."
                                onKeyPress={(event) => this.onEnter(event)}
                                tabIndex = {0}
                                ref={this.inputRef}
                            />
                        </div>
                        <div className = "send-button">
                            <IconButton
                                disableRipple
                                disableFocusRipple
                                onClick = {(event) => this.sendMessage(event)}
                            >
                                <SendIcon />
                            </IconButton>
                        </div>
                    </div>
                </div>
            )
    }
}

export default withRouter(Chat);
