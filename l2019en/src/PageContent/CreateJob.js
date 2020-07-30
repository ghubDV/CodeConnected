import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { checkAuth } from '../Components/Functions/Auth';
import { checkEmail } from '../Components/Functions/InputChecks'
import LoadingBar from 'react-top-loading-bar';
import MaterialInput from '../Components/MainContent/MaterialInput';
import Snackbar from '@material-ui/core/Snackbar';
import FormInputData from '../Components/MainContent/JSON/profileFormInputs.json'
import CSC from '../Components/MainContent/JSON/countries-states-cities.json';
import { Alert, AlertTitle } from '@material-ui/lab';
import MuiAlert from '@material-ui/lab/Alert';
import CustomImage from '../Components/MainContent/CustomImage';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import './MyProfile.css';

function SnackbarAlert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class CreateJob extends React.Component
{

    constructor(props) {
        super(props);
        this.fileUpload = React.createRef();
    }

    state = {
        isActive:undefined,
        isCompany:undefined,
        hasProfile:undefined,
        page:undefined,
        fetchBarProgress: 0,

        picture: {
            avatar:null,
        },

        formData: {
            jobName: '',
            jobDescription: '',
            jobFunction:'',
            contactEmail:'',
            experienceLevel: '',
            country:'',
            state:'',
            city:'',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            hasChanged: false,
        },

        updated:
        {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },

        errors: {
            contactEmail:{
                error:false,
                msg:''
            },
            country:{
                error:false,
                msg:''
            },
        },

        csc: {
            city: [],
            state: [],
            country: [],
            choice: undefined
        },

        snackbar: {
            open: undefined,
            severity: undefined,
            message: undefined,
        }
    }

    _mounted = false;

    checkActive()
    { 
        if(this.props.isActive === 'T' && this.props.type === 'company')
        {
            let postData;
            let page;

            if(this.props.job_id !== undefined)
            {
                page="edit";

                postData = JSON.stringify({
                    request: "getProfileEdit",
                    id: this.props.id,
                    jobID: this.props.job_id,
                    type: "job",
                    inputData : {}
                })
            }
            else
            {
                page="create";

                postData = JSON.stringify({
                    request: "getProfile",
                    id: this.props.id,
                    type: this.props.type,
                    inputData : {}
                })
            }

            let formData = new FormData();
            formData.append('data', postData);
    
            axios.post("http://"+ window.location.hostname +":8000/handleProfile.php",formData)
            .then(
                (response) =>
                {    
                    if(page === "create")
                    {
                        if(response.data.profileExists && this._mounted)
                        {
                            this.setState((prevState) => ({
                                ...prevState,
                                page: page,
                                formData:{
                                    ...prevState.formData,
                                    companyName: response.data.companyName,
                                    avatar: response.data.avatar
                                },

                                profile_id: response.data.profile_id,
                                hasProfile: true,
                                isActive: true,
                                isCompany: true
                            }))
                        }
                        else if(this._mounted)
                        {
                            this.setState((prevState) => ({
                                ...prevState,
                                hasProfile: false,
                            }))
                        }
                    }

                    else if(page === "edit" && this._mounted)
                    {
                        if(response.data.profileExists)
                        {

                            this.setState((prevState) => ({
                                ...prevState,

                                page: page,

                                formData:{
                                    ...prevState.formData,
                                    jobName: response.data.jobName,
                                    jobDescription: response.data.jobDescription,
                                    jobFunction: response.data.jobFunction,
                                    contactEmail: response.data.contactEmail,
                                    experienceLevel: response.data.experienceLevel,
                                    datePosted: response.data.datePosted,
                                    country: response.data.country,
                                    state: response.data.state,
                                    city: response.data.city,
                                    avatar: response.data.avatar,
                                    companyprofileID: response.data.company_id,
                                },

                                hasProfile: true,
                                isActive: true,
                                isCompany: true,
                                exists: true
                            }))
                        }
                        else if(this._mounted)
                        {
                            this.setState((prevState) => ({
                                ...prevState,
                                hasProfile: true,
                                isActive: true,
                                isCompany: true,
                                exists:false
                            }))
                        }
                        
                    }
        
                }
            )
            .catch(() => {
                this.openSnackbar(true,"error","Server Error!");
            })
        }
        else if(this.props.type !== 'company' && this._mounted)
        {
            this.setState((prevState) => ({
                ...prevState,
                isCompany: false
            }))
        }
        else if(this.props.isActive === 'F' && this._mounted)
        {
            this.setState((prevState) => ({
                ...prevState,
                isActive: false,
            }))
        }
    }

    handleChange = (event) => {
        let value = event.target.value;
        let id = event.target.id;

        if(id === "contactEmail")
        {
            let valid = !checkEmail(value);
            this.setState((prevState) => ({
                ...prevState,
                errors: {
                    ...prevState.errors,
                    [id]: {
                        error:valid,
                        msg:(valid) ? ('This email is not valid!'): (''),
                    }
                }
            }))
        }

        if(id === "country")
        {
            this.getJSONStates(value);
            this.setState((prevState) => ({
                ...prevState,
                formData: {
                    ...prevState.formData,
                    state: "",
                    city:"",
                },

                updated:
                {
                    ...prevState.updated,
                    state: "",
                    city:"",
                }
                
            }))
        }

        if(id === "state")
        {
            this.getJSONCities(value);

            this.setState((prevState) => ({
                ...prevState,
                formData: {
                    ...prevState.formData,
                    city:"",
                },
                updated:
                {
                    ...prevState.updated,
                    city:"",
                }
                
            }))
        }

        if(this.state.page === "create")
        {
            this.setState((prevState) => ({
                ...prevState,
                formData:{
                    ...prevState.formData,
                    [id]: value,
                    hasChanged: true
                }
            }))
        }
        else
        {
            this.setState((prevState) => ({
                ...prevState,
                formData:{
                    ...prevState.formData,
                    [id]: value,
                    hasChanged: true
                },
                updated:
                {
                    ...prevState.updated,
                    [id]: value
                }
            }))
        }
    }
    
    getJSONCountries()
    {
        let country = [];
        CSC.map((item) => 
            country.push(item.name)
        )

        this.setState((prevState) => ({
            ...prevState,
            csc:{
                ...prevState.csc,
                country: country,
                state: [],
                city: []
            }
        }))
    }

    getJSONStates(country)
    {
        let states = [];
        let tempChoice;
        CSC.map((item) => {
            if(item.name === country)
            {
                if(item.states === (null || undefined))
                {
                    return false;
                }

                tempChoice = item.states;

                states = Object.keys(item.states);
            }
            return true;
        })

        this.setState((prevState) => ({
            ...prevState,
            csc:{
                ...prevState.csc,
                state: states,
                city: [],
                choice: tempChoice
            }
        }))
    }

    getJSONCities(currentState)
    {
       let cities = this.state.csc.choice;
       this.setState((prevState) => ({
            ...prevState,
            csc:{
                ...prevState.csc,
                city: cities[currentState]
            }
        }))
    }

    //update job post
    updateJob = () =>
    {
        let inputData = this.state.updated;
        let postData;

        if(!this.state.formData.hasChanged)
        {
            this.openSnackbar(true,"warning","No fields were changed!");
            return;
        }

        if(
            this.state.formData.jobName === '' || this.state.formData.jobDescription === '' || 
            this.state.formData.jobFunction === '' || this.state.formData.contactEmail === '' || 
            this.state.formData.experienceLevel === '' || this.state.formData.country === ''
         )
         {
             this.openSnackbar(true,"error","All obligatory(*) fields need to be filled!");
             return;
         }
 
         if(this.state.errors.contactEmail.error || this.state.errors.country.error)
         {
             this.openSnackbar(true,"error","Obligatory(*) fields are empty or not filled correctly!");
             return;
         }

        //loading bar initiation
        this.addProgress(30);

        checkAuth().then((authorization) => {
            if(authorization.isValid)
            {

                postData= JSON.stringify({
                    request: "updateProfile",
                    id: this.props.job_id,
                    type: "job",
                    inputData
                });

                let formData = new FormData();

                formData.append('data', postData);

                //trying to add the profile
                axios.post("http://"+ window.location.hostname +":8000/handleProfile.php",formData)
                .then(
                    (response) => {
                        this.completeProgress();
                        console.log(response);
                        this.openSnackbar(true,response.data.severity,response.data.message);
                    }
                )
                .catch(() => {
                    this.openSnackbar(true,"error","Server response error - operation unsuccessful!");
                })

            }

            else
            {
                window.location.reload();
            }
        })
        .catch(() => {
            this.openSnackbar(true,"error","Server response error - operation unsuccessful!");
        })
    }

    //create job post
    createJob = () =>
    {
        let user_id;
        let inputData = this.state.formData;
        let postData;

        //selecting post data for the axios call


        if(!this.state.formData.hasChanged)
        {
            this.openSnackbar(true,"warning","No fields were changed!");
            return;
        }

        //handling input errors

        if(
           this.state.formData.jobName === '' || this.state.formData.jobDescription === '' || 
           this.state.formData.jobFunction === '' || this.state.formData.contactEmail === '' || 
           this.state.formData.experienceLevel === '' || this.state.formData.country === ''
        )
        {
            this.openSnackbar(true,"error","All obligatory(*) fields need to be filled!");
            return;
        }

        if(this.state.errors.contactEmail.error || this.state.errors.country.error)
        {
            this.openSnackbar(true,"error","Obligatory(*) fields are empty or not filled correctly!");
            return;
        }

        //checking user authorization before trying to add/edit the profile

        //loading bar initiation
        this.addProgress(30);

        checkAuth().then((authorization) => {
            if(authorization.isValid)
            {
                user_id = this.state.profile_id;

                postData= JSON.stringify({
                    request: "addProfile",
                    id: user_id,
                    type: "job",
                    inputData
                });

                let formData = new FormData();

                formData.append('data', postData);

                //trying to add the profile
                axios.post("http://"+ window.location.hostname +":8000/handleProfile.php",formData)
                .then(
                    (response) => {
                        this.completeProgress();
                        console.log(response);
                        this.openSnackbar(true,response.data.severity,response.data.message);
                    }
                )
                .catch(() => {
                    this.openSnackbar(true,"error","Server response error - operation unsuccessful!");
                })

            }

            else
            {
                window.location.reload();
            }
        })
        .catch(() => {
            this.openSnackbar(true,"error","Server response error - operation unsuccessful!");
        })
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
 
    componentDidMount()
    {
        this._mounted = true;
        this.checkActive();
        this.getJSONCountries();
    }

    componentDidUpdate()
    {
        console.log(this.state);
    }
    componentWillUnmount()
    {
        this._mounted = false;
    }
    
    render(){
        return(
            <div className = "container">
                <div className="position-absolute">
                    <LoadingBar
                        progress={this.state.fetchBarProgress}
                        height={3}
                        color='#FFA500'
                        onLoaderFinished={() => this.onFetchFinish()}
                    />
                </div>
                {
                    (this.state.isActive && this.state.isCompany && this.state.hasProfile && (this.state.exists || this.state.exists === undefined)) &&
                    (
                        <div className="w-100">
                            <div className="pt-3 pb-3">
                                <h3>
                                    {
                                        (this.state.page === "create") &&
                                        ("Create a job post")
                                    }

                                    {
                                        (this.state.page === "edit") &&
                                        ("Edit your job post")
                                    }
                                </h3>
                            </div>

                            <hr className="clearfix"/>

                            <div className = "pt-3 pb-3 avatar">

                                <CustomImage w="100px" h="100px" className="" shape="rounded" src={this.state.formData.avatar} default={''}/>

                            </div>

                            <hr className="clearfix"/>

                            <div id="personalInfo" className = "full-border">
                                <div className="pi-header pl-2 pt-2 pb-2">
                                    <h4>Job Info</h4>
                                </div>

                                <div className = "pi-body pl-3 pr-3">
                                    <form id="jobInfoForm">
                                        {
                                            FormInputData.job.inputs.map((input,i) => 

                                                <div className={'pi-row' + ((FormInputData.job.inputs.length - 1 !== i) ? (' border-b') : (''))} key={i}>
                                                    <div className="col-sm-3 pr-3 pl-0 pt-2 d-flex align-items-center">
                                                            <h5 className="m-0">{input.title}</h5>
                                                        </div>
                                                        <div className="col-sm-9 pl-0 pr-0">
                                                            <MaterialInput
                                                                data={
                                                                    (input.selectValues !== undefined) 
                                                                    ? 
                                                                    (input.selectValues) 
                                                                    : 
                                                                    (this.state.csc)
                                                                }
                                                                inputId={input.inputId}
                                                                inputValue={this.state.formData[input.inputId]}
                                                                type={input.type}
                                                                helperId={input.helperId}
                                                                readOnly={input.readOnly}
                                                                fullWidth={input.fullWidth}
                                                                error={
                                                                    (this.state.errors[input.inputId] !== undefined)
                                                                    ?
                                                                    (this.state.errors[input.inputId].error)
                                                                    :
                                                                    (null)
                                                                }
                                                                multiline={input.multiline}
                                                                label={input.label}
                                                                placeholder={input.placeholder}
                                                                helper=
                                                                {
                                                                    (this.state.errors[input.inputId] !== undefined)
                                                                    ?
                                                                    (
                                                                        (this.state.errors[input.inputId].error)
                                                                        ?
                                                                        (this.state.errors[input.inputId].msg)
                                                                        :
                                                                        (input.helper)
                                                                    )
                                                                    :
                                                                    (input.helper)
                                                                }

                                                                getValue={this.handleChange}
                                                            />
                                                    </div>
                                                </div>

                                            )
                                        }           
                                    </form>             
                                </div>

                                <div className="pi-footer pt-2 pb-2">
                                    <div className="col-sm-12 text-center">
                                        {
                                            (this.state.page === "create") &&
                                            (
                                                <Button
                                                    className="m-2"
                                                    variant="contained"
                                                    color="default"
                                                    size="small"
                                                    style={{background:"#FFA500"}}
                                                    onClick={this.createJob}
                                                    startIcon={<AddIcon />}
                                                >
                                                    Create
                                                </Button>
                                            )
                                        }
                                        {
                                            (this.state.page === "edit") &&
                                            (
                                                <Button
                                                    className="m-2"
                                                    variant="contained"
                                                    color="default"
                                                    size="small"
                                                    style={{background:"#FFA500"}}
                                                    onClick={this.updateJob}
                                                    startIcon={<SaveIcon />}
                                                >
                                                    save
                                                </Button>
                                            )
                                        }
                                    </div>
                                </div>

                            </div>
                            <Snackbar open={this.state.snackbar.open} autoHideDuration={5000} onClose={this.handleSnackbarClose}>
                                <SnackbarAlert onClose={this.handleSnackbarClose} severity={this.state.snackbar.severity}>
                                    {this.state.snackbar.message}
                                </SnackbarAlert>
                            </Snackbar>
                        </div>
                    )
                
                }

                {
                    (this.state.isActive === false) &&
                    (
                        <div className="w-100">
                            <Alert severity="error">
                                <AlertTitle>Error!</AlertTitle>
                                You need to activate your account before accessing your profile - <strong><Link style = {{textDecoration:'none',color: 'rgb(97, 26, 21)'}} to = '/myaccount'>Activate Here!</Link></strong>
                            </Alert>
                        </div>            
                    )
                }

                {
                    (this.state.isCompany === false) &&
                    (
                        <div className="w-100">
                            <Alert severity="error">
                                <AlertTitle>Error!</AlertTitle>
                                You need a company account to create jobs!
                            </Alert>
                        </div>            
                    )
                }

                {
                    (this.state.hasProfile === false) &&
                    (
                        <div className="w-100">
                            <Alert severity="error">
                                <AlertTitle>Error!</AlertTitle>
                                You need to create a profile first - <strong><Link style = {{textDecoration:'none',color: 'rgb(97, 26, 21)'}} to = '/myprofile'>Create Here!</Link></strong> 
                            </Alert>
                        </div>            
                    )
                }

                {
                    (this.state.exists === false) &&
                    (
                        <div className="w-100">
                            <Alert severity="error">
                                <AlertTitle>Error!</AlertTitle>
                                This job post doesn't exist - <strong><Link style = {{textDecoration:'none',color: 'rgb(97, 26, 21)'}} to = '/joblist'>Back to job list</Link></strong>
                            </Alert>
                        </div>            
                    )
                }
                
            </div>
        )
    }

}

export default CreateJob;