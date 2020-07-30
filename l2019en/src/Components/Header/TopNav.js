import React from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { Link,withRouter } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import './TopNav.css';
import MaterialDrop from '../MainContent/Material_DropMenu';
import NotificationsList from '../MainContent/NotificationList';
import { logout, checkAuth } from '../Functions/Auth';
import IconButton from '@material-ui/core/IconButton'
import Badge from '@material-ui/core/Badge';
import PersonIcon from '@material-ui/icons/Person';
import SettingsIcon from '@material-ui/icons/Settings';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ListIcon from '@material-ui/icons/List';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import NotificationsIcon from '@material-ui/icons/Notifications';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import GroupIcon from '@material-ui/icons/Group';
import MenuIcon from '@material-ui/icons/Menu';

class TopNav extends React.Component
{

    constructor(props)
    {
        super(props);
        this.pusher = new Pusher('<key>', {cluster: '<cluster>'});
    }


    state =
    {
        username: '',
        type:'',
        notificationsCount: 0,
        fetchBarProgress:0,
        notifications:[],
        openNotifications: false,
        isAuthenthicated: this.props.isAuthenthicated,
        anchorEl: null
    }

    _mounted = false;


    getNotifications()
    {
        let postData = JSON.stringify({
            request: 'getNotifications',
            id: this.props.id,
            type: this.props.type,
            inputData:{}
        });
        let notificationsCount;

        let formData = new FormData();
        formData.append('data',postData);

        this.listenForNotifications('notifications-' + this.props.type + '.' + this.props.id);

        axios.post("http://"+ window.location.hostname +":8000/handleProfile.php",formData)
        .then(
            (response) => {
                notificationsCount = response.data.notificationsCount;
                console.log(response.data);

                if(this._mounted)
                {
                    this.setState((prevState) => ({
                        ...prevState,
                        notificationsCount: parseInt(notificationsCount),
                    }));
                }
            }
        )


    }

    listenForNotifications = (channelName) => {
        const channel = this.pusher.subscribe(channelName);

        channel.bind('addNotification', data => {

            this.setState((prevState) => ({
                ...prevState,
                notificationsCount: prevState.notificationsCount + 1
            }));
        });
    }


    componentDidMount()
    {
        this._mounted=true;

        if(this.props.isAuthenthicated)
        {
            this.getNotifications();
        }
    }

    componentWillUnmount()
    {
        this._mounted=false;
    }

    componentDidUpdate(prevProps)
    {
        if(prevProps.isAuthenthicated !== this.props.isAuthenthicated)
        {
            this.setState((prevState) => ({
                ...prevState,
                isAuthenthicated: this.props.isAuthenthicated
            }));
            this.getNotifications();
        }
    }

     //loading
     addProgress = value =>
     {
        this.setState((prevState) => ({
            ...prevState,
            fetchBarProgress: prevState.fetchBarProgress + value
        }))
     }

     //complete loading
     completeProgress = () =>
     {
         this.setState((prevState) => ({
            ...prevState,
            fetchBarProgress: 100
        }))
     }

     //loading finished
     onFetchFinish = () =>
     {
         this.setState((prevState) => ({
             ...prevState,
             fetchBarProgress: 0
         }))
     }

    toMyAccount = () =>
    {
        this.props.history.push("/myaccount");
    }

    toMyProfile = () =>
    {
        this.props.history.push('/myprofile');
    }

    toJobList = () =>
    {
        this.props.history.push('/joblist');
    }

    toApplicants = () =>
    {
        this.props.history.push('/applicants');
    }

    toAppliedJobs = () =>
    {
        this.props.history.push('/appliedjobs');
    }

    handleNotificationsOpen = (event) =>
    {
        let value = event.currentTarget;
        checkAuth().then((authorization) => {
            if(authorization.isValid)
            {
                let postData = JSON.stringify({
                    request: 'getNotifications',
                    id: authorization.userdata.id,
                    type: authorization.userdata.type,
                    inputData:{}
                });

                let formData = new FormData();
                formData.append('data',postData);

                this.addProgress(30);

                axios.post("http://"+ window.location.hostname +":8000/handleProfile.php",formData)
                .then(
                    (response) => {
                        this.setState((prevState) => ({
                            ...prevState,
                            notifications: response.data.notifications,
                            notificationsCount: 0,
                            openNotifications : true,
                            anchorEl: value,
                        }));
                        this.completeProgress();
                    }
                )
                .catch(() => {
                    this.setState((prevState) => ({
                        ...prevState,
                        openNotifications : true,
                        anchorEl: value,
                    }));
                    this.completeProgress();
                })
            }
            else
            {
                logout();
            }
        })
    }

    handleNotificationsClose = () =>
    {
        let postData = JSON.stringify({
            request: 'NotificationsSeen',
            id: this.props.id,
            type: this.props.type,
            inputData:{}
        });

        let formData = new FormData();
        formData.append('data',postData);

        axios.post("http://"+ window.location.hostname +":8000/handleProfile.php",formData)
        .then(
            (response) => {
                this.setState((prevState) => ({
                    ...prevState,
                    openNotifications : false,
                    anchorEl: null
                }))
            }
        )
        .catch(() => {
            this.setState((prevState) => ({
                ...prevState,
                openNotifications : false,
                anchorEl: null
            }))
        })
    }

    showSide()
    {
        var vnav = document.getElementById('vnav_wrap');
        var pageContent = document.getElementById('page_content');

        if(vnav.classList.contains('hidden'))
        {
            vnav.classList.remove('hidden');
            vnav.classList.add('visible');

            if(window.screen.width > 980)
            {
                pageContent.style.marginLeft = '260px';
            }
            else
            {
                pageContent.classList.add('darken');
            }
        }
        else
        {
            vnav.classList.remove('visible');
            vnav.classList.add('hidden');

            if(window.screen.width > 980)
            {
                pageContent.style.marginLeft = '0px';
            }
            else
            {
                pageContent.classList.remove('darken');
            }
        }
    }

    render()
    {
        return (
            <div id="header" className="flex w-100">
                <LoadingBar
                            progress={this.state.fetchBarProgress}
                            height={3}
                            color='#FFA500'
                            onLoaderFinished={() => this.onFetchFinish()}
                        />
                    <div id="hnav">
                        <div className="top-bar-item">
                            <MenuIcon className="anim-orange" onClick={this.showSide}/>
                        </div>

                        <div className="d-flex">
                            <div className = "top-bar-item">
                                {
                                    (this.state.isAuthenthicated) &&
                                    (
                                        <div className="">
                                            <IconButton aria-controls="notification-list" aria-haspopup="true" onClick={this.handleNotificationsOpen}>
                                                <Badge badgeContent={this.state.notificationsCount}>
                                                    <NotificationsIcon style={{color:'#fff'}}/>
                                                </Badge>
                                            </IconButton>

                                            <NotificationsList
                                                handleClose = {this.handleNotificationsClose}
                                                anchorEl={this.state.anchorEl}
                                                open={this.state.openNotifications}
                                                notificationsList={this.state.notifications}
                                            />
                                        </div>
                                    )
                                }
                            </div>

                            <div className = "top-bar-item">
                                {
                                    (this.state.isAuthenthicated && this.props.type === "user") &&
                                        (
                                            <MaterialDrop
                                                openImg = {this.props.username[0]}
                                                id = "profile-drop"
                                                items = {["Profile","Account Settings","Applied Jobs","Logout"]}
                                                func = {[this.toMyProfile,this.toMyAccount,this.toAppliedJobs,logout]}
                                                icons = {[<PersonIcon fontSize = "small" />, <SettingsIcon fontSize = "small" />, <AssignmentTurnedInIcon fontSize="small" />, <ExitToAppIcon fontSize = "small" />]}
                                            />
                                        )
                                }

                                {
                                    (this.state.isAuthenthicated && this.props.type === "company") &&
                                    (
                                        <MaterialDrop
                                            openImg = {this.props.username[0]}
                                            id = "profile-drop"
                                            items = {["Profile","Account Settings","My Job Posts","My Applicants","Logout"]}
                                            func = {[this.toMyProfile,this.toMyAccount,this.toJobList,this.toApplicants,logout]}
                                            icons = {[<PersonIcon fontSize = "small" />, <SettingsIcon fontSize = "small" />,<ListIcon fontSize = "small" />, <GroupIcon fontSize = "small" /> , <ExitToAppIcon fontSize = "small" />]}
                                        />
                                    )
                                }
                            </div>

                            {
                                (!this.state.isAuthenthicated) &&
                                (
                                    <Link to="/login">
                                        <AccountCircleIcon  className="link"/>
                                    </Link>
                                )
                            }
                        </div>

                    </div>
            </div>
        );
    }
}

export default withRouter(props => <TopNav {...props}/>);
