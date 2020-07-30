import React from 'react';
import axios from 'axios';
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import { withRouter,Link } from 'react-router-dom';
import { checkAuth } from '../Components/Functions/Auth';
import LoadingBar from 'react-top-loading-bar';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import NotFoundComponent from '../PageContent/404';
import CustomImage from '../Components/MainContent/CustomImage';
import DataCard from  '../Components/MainContent/DataCard';
import fieldTitles from '../Components/MainContent/JSON/showProfileTitles.json';
import Button from '@material-ui/core/Button';
import './Profiles.css';

function SnackbarAlert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class Jobs extends React.Component {

    state = {
        fetchBarProgress:0,
        profileData: {
            job:
            {

            }
        },

        snackbar:
        {
            open: undefined,
            severity: undefined,
            message:undefined,
        }
            
    }

    _mounted = false;

    checkJobExistence()
    {
        let stringArr = this.props.job_id.split('.');
        let type = stringArr[0];
        let idName = stringArr[0];
        let id = stringArr[1];
        let formData = new FormData();


        formData.append('data',JSON.stringify({id:id,idType:idName,type:type,request:'getProfile'}));

        this.addProgress(30);

        axios.post("http://"+ window.location.hostname +":8000/handleProfile.php",formData)
        .then(
            (response) =>
            {
                if(this._mounted)
                {
                    console.log(response.data);

                    if(type === "job")
                    {
                        this.setState({
                            profileData: {
    
                                files:{
                                    avatar:response.data.avatar
                                },
    
                                job:{
                                    companyName: response.data.companyName,
                                    companyLink: '/profiles/company.' + response.data.company_id,
                                    jobName: response.data.jobName,
                                    jobDescription: response.data.jobDescription,
                                    jobFunction: response.data.jobFunction,
                                    experienceLevel: response.data.experienceLevel,
                                    datePosted: response.data.datePosted,
                                    applicationsNumber: response.data.applicationsNumber,
                                    location: (response.data.country + 
                                              ((response.data.state !== '' && response.data.state !== null)  ? (', ' + response.data.state) : ('')) +
                                              ((response.data.city !== '' && response.data.city !== null) ? (', ' + response.data.city) : (''))),
                                }
                            },
    
                            profileExists: response.data.profileExists,
                            companyprofile: response.data.company_id,
                            userType: type
                        })
                    }
                    this.completeProgress();
                }
            }
        )
    }

    //creating application for the current job
    apply = () =>
    {
        //authorizing user
        checkAuth().then((authorization) => {
            if(authorization.isValid && authorization.userdata.isActive === 'T' && authorization.userdata.type === "user")
            {
                let stringArr = this.props.job_id.split('.');
                let jobID = stringArr[1];

                let postData = JSON.stringify({
                    request: "addApplication",
                    id: authorization.userdata.id,
                    jobID: jobID,
                    companyID: this.state.companyprofile,
                    type: authorization.userdata.type,
                    inputData: {}
                })

                console.log(postData);

                let formData = new FormData();

                formData.append('data',postData);

                //trying to add application
                axios.post("http://"+ window.location.hostname +":8000/handleProfile.php",formData)
                .then(
                    (response) =>
                    {
                        console.log(response.data);
                        this.openSnackbar(true,response.data.severity,response.data.message);
                    }
                )
            }
            else if(authorization.userdata.isActive === 'F')
            {
                this.openSnackbar(true,'error','You need to activate your account to apply!');
            }
        })
        .catch((error) => {
            console.log(error);
        })
    }

    numberOfApplicants = () =>
    {
        let number = parseInt(this.state.profileData.job.applicationsNumber);

        if(number === 0)
        {
            return(
                <React.Fragment>
                    <span style = {{color:'#ffc107'}}>{'No Applications'}</span>
                </React.Fragment>
            )
        }
        else if (number === 1)
        {
            return(
                <React.Fragment>
                    <span style = {{color:'green'}}>{number + ' Application'}</span>
                </React.Fragment>
            )
        }
        else
        {
            return (
                <React.Fragment>
                    <span style = {{color:'green'}}>{number + ' Applications'}</span>
                </React.Fragment>
            );
        }
    }
    notFound = () => 
    {
        return <NotFoundComponent />;
    }

    toLogin = () =>
    {
        this.props.history.push('/login');
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

    openSnackbar = (o,s,m) =>
    {
        this.setState((prevState) => ({
            ...prevState,
            snackbar: {
                open: o,
                severity: s,
                message: m
            }
        }))
    }

    handleSnackbarClose = () => 
    {
        this.setState((prevState) => ({
            ...prevState,
            snackbar: {
                ...prevState.snackbar,
                open: false,
            }
        }))
    }

    componentDidMount()
    {
        this._mounted = true;
        this.checkJobExistence();
    }

    componentWillUnmount()
    {
        this._mounted = false;
    }
    render()
    {
        return(
            <div className="container">
                <div className="position-absolute">
                    <LoadingBar
                        progress={this.state.fetchBarProgress}
                        height={3}
                        color='#FFA500'
                        onLoaderFinished={() => this.onFetchFinish()}
                    />
                </div>
                {
                    (this.state.profileExists === false) &&
                    (
                        <div className = "d-flex w-100 h-100">
                            {this.notFound()}
                        </div>
                    )
                }

                {
                    (this.state.profileExists === true) &&
                    (
                        <div>
                            <div className = "pt-3 pb-3 avatar">

                                <CustomImage w="125px" h="125px" className=" avatar-img" src={this.state.profileData.files.avatar} shape="rounded" default={''} />

                                <h3 className = "text-center">
                                    {
                                        (this.state.userType === "job") &&
                                        (this.state.profileData.job.jobName)                             
                                    }
                                </h3>
                                <p className="text-muted text-center">
                                    { 
                                        <span>
                                            <Link to={this.state.profileData.job.companyLink}>
                                                {this.state.profileData.job.companyName}
                                            </Link>
                                            {(this.state.profileData.job.location !== 'null') ? (' - ' + this.state.profileData.job.location) : ('')}
                                        </span>                                          
                                    }
                                </p>
                                <p className="text-muted text-center">
                                    {
                                        ('Last updated ' + moment(
                                            momentTimezone.tz(this.state.profileData.job.datePosted + "+0000", Intl.DateTimeFormat().resolvedOptions().timeZone).format()
                                        ).fromNow() + ' - ')
                                    }
                                    {
                                        this.numberOfApplicants()
                                    }
                                </p>
                                <p>
                                    {
                                    
                                        (this.props.isAuthenthicated && this.props.type === "user") &&
                                        (
                                            <Button style={{color:"#fff",background:"#FFA500"}} variant="contained" onClick={this.apply} disableElevation>
                                                Apply for this job
                                            </Button>
                                        )
                                    
                                    }
                                    {
                                    
                                        (this.props.isAuthenthicated && this.props.type === "company") &&
                                        (
                                            <Button variant="contained" disableElevation disabled>
                                                Apply for this job
                                            </Button>
                                        )
                                
                                    }

                                    {       
                                    
                                        (!this.props.isAuthenthicated) &&
                                        (
                                            <Button style={{color:"#fff",background:"#FFA500"}} variant="contained" onClick={this.toLogin} disableElevation>
                                                Authenticate to apply
                                            </Button>
                                        )
                                
                                    }   
                                </p>
                            </div>

                            <hr className="clearfix" />

                            <div id="profileData">
                                {
                                    fieldTitles[this.state.userType + 'Titles'].map((item,index) =>
                                        <DataCard 
                                            title={item.title}
                                            description={this.state.profileData.job[item.id]}
                                            link={item.isLink}
                                            key={index}
                                        />
                                    )
                                }
                            </div>

                        </div>
                    )
                } 
                <Snackbar open={this.state.snackbar.open} autoHideDuration={5000} onClose={this.handleSnackbarClose}>
                    <SnackbarAlert onClose={this.handleSnackbarClose} severity={this.state.snackbar.severity}>
                        {this.state.snackbar.message}
                    </SnackbarAlert>
                </Snackbar> 
            </div>
        );
    }

}

export default withRouter(Jobs);