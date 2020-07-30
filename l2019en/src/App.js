import React from 'react';
import Pusher from 'pusher-js';
import axios from 'axios';

import {
    Route,
    Switch,
    Redirect,
    withRouter
} from "react-router-dom";


//auth functions
import { checkAuth,handleLogin } from './Components/Functions/Auth';

import './App.css';
import SideNav from './Components/SideNavbar/SideNav';
import TopNav from './Components/Header/TopNav';
import Footer from './Components/Footer/Footer'

//AuthenthicatedRoutes
import PrivateRoute from './Components/PrivateRoutes/PrivateRoute';

//Content components
import SearchComponent from './PageContent/Search';
import RegisterComponent from "./PageContent/Register";
import LoginComponent from './PageContent/Login';
import ForgotComponent from './PageContent/Forgot';
import NotFoundComponent from "./PageContent/404";
import ProtectedComponent from "./PageContent/protected";
import MyAccountComponent from "./PageContent/MyAccount";
import MyProfileComponent from "./PageContent/MyProfile";
import ProfilesComponent from "./PageContent/Profiles";
import JobsComponent from "./PageContent/Jobs";
import CreateJobComponent from "./PageContent/CreateJob";
import JobListComponent from "./PageContent/JobList";
import AppliedJobsComponent from "./PageContent/MyAppliedJobs";
import ApplicantsComponent from "./PageContent/Applicants";
import ChatComponent from "./PageContent/Chat";

//loading
import LoadingBar from 'react-top-loading-bar';

//other components
import AlertDialog from './Components/MainContent/MaterialDialog';

class App extends React.Component
{

    constructor(props)
    {
        super(props);
        this.pusher = new Pusher('<key>', {cluster: '<cluster>'});
        this.listenToGlobal();
    }

    state =
    {
        isAuthenthicated : false,
        username:'',
        type:'',
        id:'',
        isActive: 'F',
        fetchBarProgress: 0,
        token: '',
        openDialog: false,
        chatChannel: undefined,
        dialogTitle: '',
        dialogBody: '',
    }

    _mounted = false;

    listenToGlobal = () =>
    {
        const channel = this.pusher.subscribe('global-channel');

        channel.bind('notify', data => {
            if(data.for === this.state.type + '.' + this.state.id && this._mounted)
            {
                this.setState((prevState) => ({
                    ...prevState,
                    openDialog: true,
                    partner: data.from,
                    dialogTitle: 'Chat request',
                    dialogBody: data.from + " has invited you to a chat session.",
                    chatChannel: data.channelName,
                    linkToPartner: data.linkToPartner,
                }),() => {
                    //if user fails to respond to the chat request
                    let thisClass = this;
                    setTimeout(function(){
                        if(thisClass.state.openDialog)
                        {
                            thisClass.closeDialog();
                            thisClass.systemMessage('timeout');
                        }
                    },30000);
                })
            }
        });
    }

    awaitAuthorization = () =>
    {
        checkAuth().then((authorization) => {
            if(authorization.userdata !== undefined && authorization.isValid)
            {
                if(this._mounted)
                {
                    this.setState({
                        id:authorization.userdata.id,
                        username: authorization.userdata.username,
                        type: authorization.userdata.type,
                        isAuthenthicated:true,
                        isActive: authorization.userdata.isActive
                    });
                }
            }
            else if(!authorization.isValid && this._mounted)
            {
                this.setState({username:'',type:'',isAuthenthicated:false});
            }

        })
    }

    componentDidMount()
    {
        require('./PageContent/VanillaJS/func');

        this._mounted = true;
        //this listens when the page is loaded from cache and reloads it so the js will be loaded properly onto the page
        /*window.addEventListener('popstate', (event) => {
            window.location.reload();
        });*/
        this.awaitAuthorization();
    }

    componentWillUnmount()
    {
        this._isMounted = false;
    }

    //loading
    addProgress = value =>
    {
        this.setState({
            fetchBarProgress: this.state.fetchBarProgress + value
        });
    }

    //complete loading
    completeProgress = () =>
    {
        setTimeout(500);
        this.setState({
            fetchBarProgress: 100
        });
    }

    //loading finished
    onFetchFinish = () =>
    {
        setTimeout(500);
        this.setState({
            fetchBarProgress: 0
        })
    }

    //starting chat session
    startChat = () =>
    {
        if(this.state.chatChannel !== undefined && this.state.chatChannel !== null)
        {
            this.systemMessage('joined');

            this.props.history.push({
                pathname: '/chat',
                state: { chatChannel: this.state.chatChannel, partner: this.state.partner, linkToPartner: this.state.linkToPartner}
            });
        }
    }

    systemMessage = (type) =>
    {
        if(this.state.chatChannel !== undefined && this.state.chatChannel !== null)
        {
            let postData = {
                request: 'sendMessage',
                message:{
                    author: 'system',
                    type: type,
                },
                channel: this.state.chatChannel,
            }

            axios.post("http://"+ window.location.hostname +":8000/chatFunctions.php",postData)
            .then(
                (response) =>
                {

                }
            )
        }
    }

    declineChat = () =>
    {
        this.systemMessage('declineRequest');
    }

    closeDialog = () =>
    {
        this.setState((prevState) => ({
            ...prevState,
            openDialog: false,
        }))
    }


    render()
    {
        return (
            <div id="page_wrap">
                <TopNav
                    id={this.state.id}
                    username={this.state.username}
                    type={this.state.type}
                    isAuthenthicated={this.state.isAuthenthicated}
                    notificationsCount={this.state.notificationsCount}
                />

                <AlertDialog
                    isOpen={this.state.openDialog}
                    title={this.state.dialogTitle}
                    body={this.state.dialogBody}
                    closeDialog={this.closeDialog}
                    onAccept={this.startChat}
                    onDecline={this.declineChat}
                />

                <div id="body" className="container-fluid">

                    <SideNav type={this.state.type} isAuthenthicated={this.state.isAuthenthicated}/>

                    <div id="page_content" className="container-fluid d-flex">
                        <div className="position-absolute">
                            <LoadingBar
                                progress={this.state.fetchBarProgress}
                                height={3}
                                color='#FFA500'
                                onLoaderFinished={() => this.onFetchFinish()}
                            />
                        </div>

                        <Switch>
                            <Route exact
                                   path="/"
                                   component={props => (
                                       <SearchComponent {...props} isAuthenthicated = {this.state.isAuthenthicated}/>
                                   )}
                            />

                            <Route exact
                                   path="/profiles/:pid"
                                   component={props => (
                                        <ProfilesComponent {...props} profile_id = {props.match.params.pid}/>
                                   )}
                            />
                            <Route exact
                                   path="/jobs/:pid"
                                   component={props => (
                                        <JobsComponent {...props} type={this.state.type} isAuthenthicated={this.state.isAuthenthicated} job_id = {props.match.params.pid} />
                                   )}
                            />
                            <PrivateRoute
                                   path="/chat"
                                   component={props => (
                                        <ChatComponent
                                            {...props}
                                        />
                                   )}
                            />

                            <PrivateRoute
                                   path="/register"
                                   noLog
                                   component={props => (
                                        <RegisterComponent {...props} />
                                   )}
                             />

                             <PrivateRoute
                                   path="/forgot"
                                   noLog
                                   component={props => (
                                        <ForgotComponent {...props} />
                                   )}
                             />

                            <PrivateRoute
                                   path="/login"
                                   noLog
                                   component = {props => (
                                        <LoginComponent {...props}
                                                        handleLogin={handleLogin}
                                                        addProgress = {this.addProgress}
                                                        completeProgress = {this.completeProgress}
                                                        updateAuth={this.awaitAuthorization}
                                        />
                                   )}
                            />

                            <PrivateRoute
                                path = "/protected"
                                component = {ProtectedComponent}
                            />

                            <PrivateRoute
                                path = "/myaccount"
                                component = {(props) => (
                                    <MyAccountComponent {...props}

                                    />
                                )}
                            />

                            <PrivateRoute
                                path = "/myprofile"
                                component = {(props) => (
                                    <MyProfileComponent {...props}

                                    />
                                )}
                            />

                            <PrivateRoute
                                path = "/createjob"
                                component = {(props) => (
                                    <CreateJobComponent {...props}

                                    />
                                )}
                            />

                            <PrivateRoute
                                path = "/editjob/:jobID"
                                component = {(props) => (
                                    <CreateJobComponent {...props}
                                        job_id = {props.match.params.jobID}

                                    />
                                )}
                            />

                            <PrivateRoute
                                path = "/joblist"
                                component = {(props) => (
                                    <JobListComponent
                                        {...props}

                                    />
                                )}
                            />

                            <PrivateRoute
                                path = "/appliedjobs"
                                component = {(props) => (
                                    <AppliedJobsComponent
                                        {...props}

                                    />
                                )}
                            />

                            <PrivateRoute
                                path = "/applicants"
                                component = {(props) => (
                                    <ApplicantsComponent
                                        {...props}

                                    />
                                )}
                            />

                            <Route exact path="/404" component={NotFoundComponent} />
                            <Redirect to="/404"/>
                        </Switch>
                    </div>

                    <Footer />

                </div>

            </div>
        );
    }
}

export default withRouter(props => <App {...props} />);
