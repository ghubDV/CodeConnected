import React from 'react';
import { logout } from '../Functions/Auth';
import SideNavDrop from './SideNavDrop'
import SideLink from './SideLink'
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ListIcon from '@material-ui/icons/List';
import PeopleIcon from '@material-ui/icons/People';
import PersonIcon from '@material-ui/icons/Person';
import SettingsIcon from '@material-ui/icons/Settings';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import './SideNav.css'

class SideNav extends React.Component
{
    

    render()
    {
        return (

            <div id="vnav_wrap" className="visible" style={{padding:'0'}}>
                <div id="vnav">
                    <div id="vnav-container">
                    <SideLink classN="side-nav-item" icon={<SearchIcon style={{marginRight: '8px'}} fontSize="small"/>} text="Search" path="/" />
                        {
                            (this.props.isAuthenthicated && this.props.type === 'company') &&
                            (
                                <React.Fragment>
                                    <SideLink classN="side-nav-item orange" icon={<AddIcon style={{marginRight: '8px'}} fontSize="small"/>} text="Create a new job post" path="/createjob" />
                                    <SideNavDrop
                                        name = "Manage your job posts"
                                        linkList = {["Job list","My Applicants"]}
                                        linkPath = {["/joblist","/applicants"]}
                                        linkIcons = {[
                                                        <ListIcon fontSize='small' style={{marginRight: '8px'}} />,
                                                        <PeopleIcon fontSize='small' style={{marginRight: '8px'}} />
                                                    ]}
                                        toggleID = "jobsDrop"
                                        dropBtnID = "dropBtn1"
                                    />
                                </React.Fragment>
                            )
                        }

                        {
                            (this.props.isAuthenthicated && this.props.type === 'user') &&
                            (
                                <SideLink classN="side-nav-item orange" icon={<AssignmentTurnedInIcon style={{marginRight: '8px'}} fontSize="small"/>} text="Applications" path="/appliedjobs" />
                            )
                        }

                        {
                            (this.props.isAuthenthicated) &&
                            (
                                <SideNavDrop
                                    name = "Manage account"
                                    linkList = {["Profile","Account settings","Logout"]}
                                    linkPath = {["/myprofile","/myaccount",null]}
                                    linkFunc = {[null,null,() => logout()]}
                                    linkIcons = {[
                                                    <PersonIcon fontSize='small' style={{marginRight: '8px'}} />,
                                                    <SettingsIcon fontSize='small' style={{marginRight: '8px'}} />,
                                                    <ExitToAppIcon fontSize='small' style={{marginRight: '8px'}} />
                                                ]}
                                    toggleID = "accountDrop"
                                    dropBtnID = "dropBtn2"
                                />
                            )
                        }

                        {
                            (!this.props.isAuthenthicated) &&
                            (
                                <SideLink classN="side-nav-item orange" icon={<AccountCircleIcon style={{marginRight: '8px'}} fontSize="small"/>} text="Authenthicate" path="/login" />
                            )
                        }
                    </div>
                 </div>
            </div>
        );
    }
}

export default SideNav;