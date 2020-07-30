import React from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';

class pusherTest extends React.Component
{
    constructor(props) {
        super(props);
        this.pusher = new Pusher('6feeb63ea40f0c0b8052', {cluster: 'eu'});
        this.listenForChanges();
    }

    listenForChanges = () => {
        const channel = this.pusher.subscribe('my-channel');

        channel.bind('my-event', data => {
            alert(JSON.stringify(data));
            this.setState({ user: null, showUserProfile: false, key: data.key });
        });
    }

    test()
    {
        axios.post("http://localhost:8000/pushertest.php")
        .then(
            (response) =>
            {
                console.log(response)
            }
        )
    }

    render()
    {
        return(
            <div>
                {console.log(this.state)}
                <button onClick={() => this.test()}>push</button>
            </div>
        )
    }
}

export default pusherTest