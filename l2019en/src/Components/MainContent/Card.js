import React from 'react';
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import axios from 'axios';
import { withRouter,Link } from 'react-router-dom';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import CustomImage from './CustomImage';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete';
import EmailIcon from '@material-ui/icons/Email';
import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';
import RefreshIcon from '@material-ui/icons/Refresh';
import ChatIcon from '@material-ui/icons/Chat';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase } from '@fortawesome/free-solid-svg-icons';
import './Card.css';

class Card extends React.Component
{

    toPage = () =>
    {
        if(this.props.data.type === "job")
        {
            this.props.history.push('/jobs/' + this.props.data.type + '.' + this.props.data.id);
        }
        else
        {
            this.props.history.push('/profiles/' + this.props.data.type + '.' + this.props.data.id);
        }
    }
    
    toEdit = () =>
    {
        this.props.history.push('/editjob/' + this.props.data.id);
    }

    startChat = (event) =>
    {
        let channelName = this.props.company_id + '.' + this.props.data.user_id;
        let postData = {
            request:"inviteChat",
            channelName: channelName,
            for: "user." + this.props.data.user_id,
            fromName: this.props.data.companyName,
            linkToPartner: '/profiles/company.' + this.props.data.companyprofile_id,
        };

        axios.post("http://"+ window.location.hostname +":8000/chatFunctions.php",postData)
        .then(
            (response) =>
            {
                if(response.data.result === "success")
                {
                    this.props.history.push({
                        pathname: '/chat',
                        state: { 
                            chatChannel: this.props.company_id + '.' + this.props.data.user_id, 
                            partner: this.props.data.first_name + ' ' + this.props.data.last_name,
                            linkToPartner: '/profiles/user.' + this.props.data.userprofile_id,
                        }
                    })
                }
                else
                {
                    
                }
            }
        )
        .catch(() => {
        })

    }

    delete = () =>
    {
        this.props.disableJob(this.props.data.id);
    }

    deleteApplication = () =>
    {
        this.props.deleteApplication(this.props.data.job_id,this.props.data.userprofile_id);
    }

    renderCardButtons()
    {
        //card buttons for applied job list page
        if(this.props.for === "jobList")
        {
            if(this.props.data.status === 'inactive')
            {
                return(
                    <React.Fragment>  
                        <Tooltip title="re-activate">
                            <IconButton onClick={() => this.props.reActivate(this.props.data.id)}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
    
                    </React.Fragment>
                );
            }
            else
            {
                return(
                    <React.Fragment>
                        <Button onClick={() => this.props.history.push('/jobs/job.' + this.props.data.id)}>view</Button>
                        <Tooltip title="edit">
                            <IconButton onClick={this.toEdit}>
                                <CreateIcon />
                            </IconButton>
                        </Tooltip>
    
                        <Tooltip title="delete">
                            <IconButton onClick={this.delete}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
    
                    </React.Fragment>
                );
            }
        }

        //card buttons for applied jobs page
        else if(this.props.for === "appliedJobs")
        {
            if(this.props.data.status === "pending")
            {
                return(
                    <React.Fragment>
                        <Button onClick={() => this.props.history.push('/jobs/job.' + this.props.data.job_id)}>view</Button>

                        <Tooltip title="delete">
                            <IconButton onClick={this.deleteApplication}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
    
                    </React.Fragment>
                );
            }
            else if(this.props.data.status === "accepted") 
            {
                return(
                    <React.Fragment>

                        <Button onClick={() => this.props.history.push('/jobs/job.' + this.props.data.job_id)}>view</Button>

                        <CopyToClipboard onCopy= {() => this.props.openSnackbar()} text={this.props.data.contactEmail}>
                            <Tooltip title="get contact email">
                                <IconButton>
                                    <EmailIcon />
                                </IconButton>
                            </Tooltip>
                        </CopyToClipboard>
        
                    </React.Fragment>
                );
            }

            else
            {
                return(
                    <Button onClick={() => this.props.history.push('/jobs/job.' + this.props.data.job_id)}>view</Button>
                );
            }
        }

        //card buttons for applicants page
        else if(this.props.for === "applicants")
        {
            return(
                <React.Fragment>
                    <Tooltip title="view profile">
                        <IconButton onClick={() => this.props.history.push('/profiles/user.' + this.props.data.userprofile_id)}>
                            <AccountBoxIcon />
                        </IconButton>
                    </Tooltip>
                    {
                        (this.props.data.cv !== '') &&
                        (
                            <a style={{textDecoration:'none',color:'#000'}} href= {this.props.data.cvFile} target='_blank' rel="noopener noreferrer" download = {this.props.data.cv.substr(this.props.data.cv.lastIndexOf('/') + 1,this.props.data.cv.length - 1)}>
                                <Tooltip title="download resume">
                                    <IconButton>
                                        <AssignmentIcon>
                                        </AssignmentIcon>
                                    </IconButton>
                                </Tooltip>
                            </a>
                        )
                    }

                    <Tooltip title="chat with applicant">
                        <IconButton onClick = {(event) => this.startChat(event)}>
                            <ChatIcon/>
                        </IconButton>
                    </Tooltip>

                    {
                        (this.props.data.status === "pending") &&
                        (
                            <React.Fragment>
                                <Tooltip title="accept">
                                    <IconButton style={{color:'#4caf50'}} onClick={() => this.props.setApplicationStatus(this.props.data.job_id,this.props.data.userprofile_id,'accepted')}>
                                        <DoneIcon />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="decline">
                                    <IconButton style={{color:'#d32f2f'}}  onClick={() => this.props.setApplicationStatus(this.props.data.job_id,this.props.data.userprofile_id,'declined')}>
                                        <ClearIcon />
                                    </IconButton>
                                </Tooltip>
                            </React.Fragment>
                        )
                    }

                    {
                        (this.props.data.status === "declined") &&
                        (
                            <Tooltip title="accept">
                                <IconButton style={{color:'#4caf50'}} onClick={() => this.props.setApplicationStatus(this.props.data.job_id,this.props.data.userprofile_id,'accepted')}>
                                    <DoneIcon />
                                </IconButton>
                            </Tooltip>
                        )
                    }

                    {
                        (this.props.data.status === "accepted") &&
                        (
                            <Tooltip title="decline">
                                <IconButton style={{color:'#d32f2f'}}  onClick={() => this.props.setApplicationStatus(this.props.data.job_id,this.props.data.userprofile_id,'declined')}>
                                    <ClearIcon />
                                </IconButton>
                            </Tooltip>
                        )
                    }

                </React.Fragment>
            );
        }

        //card buttons for search page
        else
        {
            return(
                <Button onClick={this.toPage}>view</Button>
            );
        }
    }

    renderCardData()
    {
        //card data for a job card
        if(this.props.data.type === "job")
        {
            return(
                <React.Fragment>
                    <h5 className="card-title">{this.props.data.jobName}</h5>
                    <p className="card-text text-muted">
                        {this.props.data.companyName}
                        {
                           (this.props.data.country !== null)
                           ?
                           (
                            (' - ') +
                            (this.props.data.country) +
                            (this.props.data.state !== '' && this.props.data.state !== null ? (', ' + this.props.data.state) : ('')) +
                            (this.props.data.city !== '' && this.props.data.city !== null ? (', ' + this.props.data.city) : ('')) 
                           )
                           :
                           ('')
                        }
                    </p>
                    <p className="card-text">
                        Last updated {moment(
                            momentTimezone.tz(this.props.data.datePosted + "+0000", Intl.DateTimeFormat().resolvedOptions().timeZone).format()
                        ).fromNow()}
                    </p>
                    <p className="card-text">Experience Level: {this.props.data.experienceLevel}</p>
                </React.Fragment> 
            )
        }
        //card data for a company card
        else if(this.props.data.type === "company")
        {
            return(
                <React.Fragment>
                    <h5 className="card-title">{this.props.data.companyName}</h5>
                    <p className="card-text">
                        <FontAwesomeIcon icon={faBriefcase} className="mr-1"/>
                        {this.props.data.workDomain}
                    </p>
                    <p className="card-text text-muted">
                        {
                            (this.props.data.country) +
                            (this.props.data.state !== '' && this.props.data.state !== null ? (', ' + this.props.data.state) : ('')) +
                            (this.props.data.city !== '' && this.props.data.city !== null ? (', ' + this.props.data.city) : ('')) 
                        }
                    </p>
                </React.Fragment> 
            )
        }

        //card data for a user card
        else if(this.props.data.type === "user")
        {
            return(
                <React.Fragment>
                    <h5 className="card-title">{this.props.data.first_name + ' ' + this.props.data.last_name}</h5>
                    <p className="card-text">
                        <FontAwesomeIcon icon={faBriefcase} className="mr-1"/>
                        {this.props.data.profession}
                    </p>
                    <p className="card-text text-muted">
                        {
                            (this.props.data.country) +
                            (this.props.data.state !== '' && this.props.data.state !== null ? (', ' + this.props.data.state) : ('')) +
                            (this.props.data.city !== '' && this.props.data.city !== null ? (', ' + this.props.data.city) : ('')) 
                        }
                    </p>
                </React.Fragment> 
            )
        }

        //card data for a application card
        else if(this.props.data.type === "application")
        {
            return(
                <React.Fragment>
                    <div className="d-flex align-items-center mb-3">
                        <strong>Status:</strong>
                        {
                            (this.props.data.status === 'pending') &&
                            (<span className="indicator indicator-warning ml-1">{this.props.data.status.toUpperCase()}</span>)
                        }
                        {
                            (this.props.data.status === 'accepted') &&
                            (<span className="indicator indicator-success ml-1">{this.props.data.status.toUpperCase()}</span>)
                        }
                        {
                            (this.props.data.status === 'declined') &&
                            (<span className="indicator indicator-error ml-1">{this.props.data.status.toUpperCase()}</span>)
                        }
                    </div>
                    <p className="card-text">
                        <strong>Job Title:</strong> {this.props.data.jobName}
                    </p>
                    <p className="card-text">
                        <strong>Company:</strong> <Link to = {"/profiles/company." + this.props.data.companyprofile_id}>
                                                        {this.props.data.companyName}
                                                  </Link>
                    </p>
                    
                    <p className="card-text text-muted">
                         Last updated {moment(
                            momentTimezone.tz(this.props.data.updated_on + "+0000", Intl.DateTimeFormat().resolvedOptions().timeZone).format()
                        ).fromNow()}
                    </p>
                </React.Fragment> 
            )
        }

        //card data for a applicant card
        else if(this.props.data.type === "applicant")
        {
            return(
                <React.Fragment>
                    <h5 className="card-title">{this.props.data.first_name + ' ' + this.props.data.last_name}</h5>
                    <div className="d-flex align-items-center mb-3">
                        <strong>Status:</strong>
                        {
                            (this.props.data.status === 'pending') &&
                            (<span className="indicator indicator-warning ml-1">{this.props.data.status.toUpperCase()}</span>)
                        }
                        {
                            (this.props.data.status === 'accepted') &&
                            (<span className="indicator indicator-success ml-1">{this.props.data.status.toUpperCase()}</span>)
                        }
                        {
                            (this.props.data.status === 'declined') &&
                            (<span className="indicator indicator-error ml-1">{this.props.data.status.toUpperCase()}</span>)
                        }
                    </div>

                    <p className="card-text">
                        <FontAwesomeIcon icon={faBriefcase} className="mr-1"/>
                        {this.props.data.profession}
                    </p>
                    <p className="card-text text-muted">
                        {
                            (this.props.data.country) +
                            (this.props.data.state !== '' && this.props.data.state !== null ? (', ' + this.props.data.state) : ('')) +
                            (this.props.data.city !== '' && this.props.data.city !== null ? (', ' + this.props.data.city) : ('')) 
                        }
                    </p>
                </React.Fragment> 
            )
        }
    }

    render()
    {
        return(
            <React.Fragment>
                <div className="card mb-3">
                    <div className="row no-gutters">
                        <div className="card-image col-md-2">
                            <CustomImage w="100px" h="100px" className=" card-img m-0 shadow-none" src={this.props.data.avatar} shape="square" default={''} />
                        </div>
                        <div className="col-md-10">
                            <div className="card-body">
                                {this.renderCardData()}
                            </div>
                        </div>
                        <div className="card-footer w-100">
                                {this.renderCardButtons()}
                        </div>
                    </div>
                </div>

                <hr className="clearfix"/>
            </React.Fragment>
        );
    }
}

export default withRouter(Card);