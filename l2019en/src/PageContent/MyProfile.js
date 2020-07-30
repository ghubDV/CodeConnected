import React from 'react';
import axios from 'axios';
import isURL from 'validator/lib/isURL';
import { Link } from 'react-router-dom';
import { checkAuth } from '../Components/Functions/Auth';
import { checkEmail,checkName } from '../Components/Functions/InputChecks'
import LoadingBar from 'react-top-loading-bar';
import MaterialInput from '../Components/MainContent/MaterialInput';
import Snackbar from '@material-ui/core/Snackbar';
import FormInputData from '../Components/MainContent/JSON/profileFormInputs.json'
import CSC from '../Components/MainContent/JSON/countries-states-cities.json';
import { Alert, AlertTitle } from '@material-ui/lab';
import MuiAlert from '@material-ui/lab/Alert';
import CustomImage from '../Components/MainContent/CustomImage';
import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SaveIcon from '@material-ui/icons/Save';
import './MyProfile.css';

function SnackbarAlert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class MyProfile extends React.Component
{

    constructor(props) {
        super(props);
        this.fileUpload = React.createRef();

    }

    state = {
        isActive:undefined,
        fetchBarProgress: 0,

        files: {
            avatarPreview: null,
            avatar:null,
            cvFile: null
        },

        path: {
            cvPath: undefined
        },

        formData: {
            user: {
                firstName:'',
                lastName:'',
                contactEmail: '',
                birthDate: '',
                country:'',
                state:'',
                city:'',
                description:'',
                profession:'',
                education:'',
                hasChanged: false,
                changedFields: undefined
            },

            company: {
                companyName:'',
                workDomain:'',
                companyDescription:'',
                founded:'',
                contactEmail: '',
                country:'',
                state:'',
                city:'',
                website:'',
                hasChanged: false,
                changedFields: undefined
            }
        },

        errors: {
            firstName: {
                error:false,
                msg:''
            },
            lastName: {
                error:false,
                msg:''
            },
            contactEmail:{
                error:false,
                msg:''
            },
            birthDate:{
                error:false,
                msg:''
            },
            founded:{
                error:false,
                msg:''
            },
            country:{
                error:false,
                msg:''
            },
            website:{
                error:false,
                msg:''
            }
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
        if(this.props.isActive === "T")
        {
            //trying to get profile data
            let postData = JSON.stringify({
                request: "getProfile",
                id: this.props.id,
                type: this.props.type,
                inputData : {}
            })

            //getting the type of user
            let userType = this.props.type;
    
            let formData = new FormData();
            formData.append('data', postData);

            this.addProgress(30);
    
            axios.post("http://"+ window.location.hostname +":8000/handleProfile.php",formData)
            .then(
                (response) =>
                {
                    if(this._mounted)
                    {
                        if(response.data.profileExists)
                        {
                            let profile = response.data;

                            if(userType === "user")
                            {
                                    this.setState((prevState) => ({
                                        ...prevState,
                                        profileExists: true,
                                        isActive: true,
                                        userType: userType,

                                        files:
                                        {
                                            avatar: profile.avatar,
                                            avatarPreview: profile.avatar,
                                            cvFile: profile.cv
                                        },

                                        path: {
                                            cvPath: profile.cvFile
                                        },

                                        formData: {
                                            user: {
                                                firstName:profile.firstName,
                                                lastName:profile.lastName,
                                                contactEmail: profile.contactEmail,
                                                birthDate: profile.birthDate,
                                                country:profile.country,
                                                state:profile.state,
                                                city:profile.city,
                                                description:profile.description,
                                                profession:profile.profession,
                                                education:profile.education,
                                                cvFile: profile.cv.substr(profile.cv.lastIndexOf('/') + 1,profile.cv.length - 1)
                                            },
                                        }
                                    }))
                            }

                            else
                            {
                                    this.setState((prevState) => ({
                                        ...prevState,
                                        profileExists: true,
                                        isActive: true,
                                        userType: userType,

                                        files:
                                        {
                                            avatar: profile.avatar,
                                            avatarPreview: profile.avatar,
                                        },

                                        formData: {
                                            company: {
                                                companyName:profile.companyName,
                                                workDomain:profile.workDomain,
                                                companyDescription: profile.companyDescription,
                                                founded:profile.founded,
                                                contactEmail:profile.contactEmail,
                                                country:profile.country,
                                                state:profile.state,
                                                city:profile.city,
                                                website:profile.website
                                            },
                                        }
                                    }))
                            }
                                
                            }   

                            else
                            {
                                this.setState((prevState) => ({
                                    ...prevState,
                                    profileExists: false,
                                    isActive: true,
                                    userType: userType,
                                }))
                            }
                        }
                if(this._mounted)
                {
                    this.completeProgress();
                }
            })
        }
        else if(this.props.isActive === 'F' && this._mounted)
        {
            this.setState({
                isActive: false
            })
        } 
            
    }

    triggerUpload = () =>
    {
        this.fileUpload.current.click();
    }

    handleChange = (event) => {
        let value = event.target.value;
        let id = event.target.id;

        if(id === "firstName" || id === "lastName")
        {
            let valid = !checkName(value);
            this.setState((prevState) => ({
                ...prevState,
                errors: {
                    ...prevState.errors,
                    [id]: {
                        error:valid,
                        msg:(valid) ? ('Name must only contain letters!'): (''),
                    }
                }
            }))
        }

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
                    [this.state.userType]:{
                        ...prevState.formData[this.state.userType],
                        state:"",
                        city:"",
                        changedFields: {
                            ...prevState.formData[this.state.userType].changedFields,
                            state:"",
                            city:""
                        }
                    }
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
                    [this.state.userType]:{
                        ...prevState.formData[this.state.userType],
                        city:"",
                        changedFields: {
                            ...prevState.formData[this.state.userType].changedFields,
                            city:""
                        }
                    }
                }
                
            }))
        }

        if(id === "website")
        {
            let valid = false;

            if(!isURL(value))
            {
                valid = true;
            }

            this.setState((prevState) => ({
                ...prevState,
                errors: {
                    ...prevState.errors,
                    [id]: {
                        error:valid,
                        msg:(valid) ? ('Website format needs to be like: http(s)://(www.)example.com'): (''),
                    }
                }
            }))
        }

        if(id === "cvFile")
        {
            this.handleFile(event.target.files[0],event.target.id)
            
            this.setState((prevState) => ({
                ...prevState,
                formData:{
                    ...prevState.formData,
                    user:
                    {
                        ...prevState.formData.user,
                        [id]: value,
                        hasChanged: true,
                        changedFields: {
                            ...prevState.formData.user.changedFields,
                            [id]: value
                        }
                    }
                }
            }))
            
            return;
        }

        (this.state.profileExists)
        ?
        (
            this.setState((prevState) => ({
                ...prevState,
                formData:{
                    ...prevState.formData,
                    [this.state.userType]:
                    {
                        ...prevState.formData[this.state.userType],
                        [id]: value,
                        hasChanged: true,
                        changedFields: {
                            ...prevState.formData[this.state.userType].changedFields,
                            [id]: value
                        }
                    }
                }
            }))
        )
        :
        (
            this.setState((prevState) => ({
                ...prevState,
                formData:{
                    [this.state.userType]:
                    {
                        ...prevState.formData[this.state.userType],
                        [id]: value
                    }
                }
            }))
        )
    }
    
    handleDate = (date) =>
    {
        let dateErr = false;
        let dateMsg = '';
        let now = new Date();

        if(date === null)
        {
            return;
        }

        if (isNaN(date.getTime())) 
        { 
            // date is not valid
            dateErr=true;
            dateMsg="Invalid date entered!";
        }

        if(this.state.userType === "user")
        {
            if(now.getFullYear() - date.getFullYear() < 18)
            {
                dateErr=true;
                dateMsg="You need to be atleast 18 years old!";
            }
        }
        else
        {
            if(now < date)
            {
                dateErr=true;
                dateMsg="You cannot choose a future foundation date!";
            }
        }

        if(!dateErr)
        {
            let month = date.getMonth() + 1;
            let day = date.getDate();

            if(month.toString().length === 1)
            {
                month = '0' + (date.getMonth() + 1);
            }

            if(day.toString().length === 1)
            {
                day = '0' + date.getDate();
            }

            date = date.getFullYear() + '-' + month.toString() + '-' + day.toString();
        }

        if(this.state.userType === "user")
        {
            this.setState((prevState) => ({
                ...prevState,
                formData:{
                    user: {
                        ...prevState.formData.user,
                        birthDate: date,
                        hasChanged: true,
                        changedFields: {
                            ...prevState.formData.user.changedFields,
                            birthDate: date,
                        }
                    }
                },
                errors:
                {
                    ...prevState.errors,
                    birthDate:{
                        error: dateErr,
                        msg:dateMsg
                    }
                }
            }))
        }

        else
        {
            this.setState((prevState) => ({
                ...prevState,
                formData:{
                    company: {
                        ...prevState.formData.company,
                        founded: date,
                        hasChanged: true,
                        changedFields: {
                            ...prevState.formData.company.changedFields,
                            founded: date,
                        }
                    }
                },
                errors:
                {
                    ...prevState.errors,
                    founded:{
                        error: dateErr,
                        msg:dateMsg
                    }
                }
            }))
        }
    }


    handleImage = (e) =>
    {

        if(e.target.files.length === 0)
        {
            return;
        }

        let picture = e.target.files[0];
        
        //max avatar size is 2MB
        if(picture.size > 2097152)
        {
            this.openSnackbar(true,"error","The chosen avatar picture is larger than 2MB!");
            return;
        }

        //getting data from image to make a preview
        let reader = new FileReader();

        reader.readAsDataURL(picture);

        reader.onload = event => {
            this.setState((prevState) => ({
                ...prevState,
                files: {
                    ...prevState.files,
                    avatarPreview: event.target.result,
                    avatar: picture
                },
                formData:
                {
                    ...prevState.formData,
                    [this.state.userType]:
                    {
                        ...prevState.formData[this.state.userType],
                        hasChanged: true,
                    }
                }
            }))
        };
    }

    handleFile = (file,id) => 
    {
        this.setState((prevState) => ({
                ...prevState,
                path: {
                    cvPath: undefined
                },
                
                files: {
                    ...prevState.files,
                    [id]: file
                }
        }))
    }

    checkWebsite = (website) =>
    {
        let exp = /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$/;

        if(!exp.test(website))
        {
            return false;
        }

        return true;

    }

    deleteCVFile = () =>
    {
        this.setState((prevState) => ({
            ...prevState,
            files: {
                ...prevState.files,
                cvFile : null
            }
        }))

        //initiating progressbar
        this.addProgress(30);

        checkAuth().then((authorization) => {
            if(authorization.isValid)
            {
                let formData = new FormData();

                let postData = {
                    id: authorization.userdata.id,
                    type: authorization.userdata.type,
                    request:"deleteCV"
                }

                formData.append('data', JSON.stringify(postData));

                axios.post("http://"+ window.location.hostname +":8000/handleProfile.php",formData)
                .then(
                    (response) =>
                    {
                        this.completeProgress();
                        console.log(response.data);
                    }
                )
            }
        })
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

    saveProfile = () =>
    {
        let user_id;
        let inputData;
        let cv = this.state.files.cvFile;
        let avatar = this.state.files.avatar;
        let config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        }
        let type;
        let postData;

        //selecting post data for the axios call

        if(this.state.profileExists)
        {
            if(!this.state.formData[this.state.userType].hasChanged)
            {
                this.openSnackbar(true,"warning","No fields were changed!");
                return;
            }

            this.setState((prevState) => ({
                ...prevState,
                formData:
                {
                    ...prevState.formData,
                    [this.state.userType]:
                    {
                        ...prevState.formData[this.state.userType],
                        hasChanged: false,
                    }
                }
            }));

            inputData = this.state.formData[this.state.userType].changedFields;
        }
        else
        {
            inputData = this.state.formData[this.state.userType];
        }

        //handling input errors

        if(this.state.userType === "user")
        {
            if(this.state.formData.user.firstName === '' || this.state.formData.user.lastName === '' || 
            this.state.formData.user.birthDate === '' || this.state.formData.user.contactEmail === '' || 
            this.state.formData.user.country === '' ||
            (this.state.files.cvFile === null || this.state.files.cvFile === '' || this.state.files.cvFile === undefined))
            {
                this.openSnackbar(true,"error","All obligatory(*) fields need to be filled!");
                return;
            }

            if(this.state.errors.firstName.error || this.state.errors.lastName.error || 
            this.state.errors.birthDate.error || this.state.errors.contactEmail.error || this.state.errors.country.error)
            {
                this.openSnackbar(true,"error","Obligatory(*) fields are empty or not filled correctly!");
                return;
            }
        }

        else
        {
            if(this.state.formData.company.companyName === '' || this.state.formData.company.workDomain === '' || 
            this.state.formData.company.companyDescription === '' || this.state.formData.company.founded === '' || 
            this.state.formData.company.contactEmail === '' || this.state.formData.company.country === '')
            {
                this.openSnackbar(true,"error","All obligatory(*) fields need to be filled!");
                return;
            }

            if(this.state.errors.founded.error || this.state.errors.contactEmail.error || this.state.errors.country.error)
            {
                this.openSnackbar(true,"error","Obligatory(*) fields are empty or not filled correctly!");
                return;
            }
        }

        //checking user authorization before trying to add/edit the profile

        //loading bar initiation
        this.addProgress(30);

        checkAuth().then((authorization) => {
            if(authorization.isValid)
            {
                user_id = authorization.userdata.id;
                type = authorization.userdata.type;

                postData= JSON.stringify({
                    request: (this.state.profileExists) ? ("updateProfile") : ("addProfile"),
                    id: user_id,
                    type: type,
                    inputData
                });

                let formData = new FormData();

                if(this.state.userType === 'user')
                {
                    formData.append('cv', cv);
                }

                formData.append('avatar',avatar);
                formData.append('data', postData);

                //trying to add the profile
                axios.post("http://"+ window.location.hostname +":8000/handleProfile.php",formData,config)
                .then(
                    (response) => {
                        console.log(response);

                        if (!this.state.profileExists && response.data.severity === "success")
                        {
                            this.setState((prevState) => ({
                                ...prevState,
                                profileExists: true
                            }));
                        }

                        this.completeProgress();
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

     componentDidUpdate()
     {
         console.log(this.state);
     }
 
    componentDidMount()
    {
        this._mounted = true;
        this.checkActive();
        this.getJSONCountries();
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
                    (this.state.isActive === true) &&
                    (
                        <div className="w-100">
                            <div className="pt-3 pb-3">
                                <h3>Profile Settings</h3>
                            </div>

                            <hr className="clearfix"/>

                            <div className = "pt-3 pb-3 avatar">

                                <CustomImage w="100px" h="100px" className="" shape="rounded" src={this.state.files.avatar} default={this.state.files.avatarPreview}/>

                                <input
                                    accept="image/*"
                                    hidden
                                    ref = {this.fileUpload}
                                    onChange = {(e)=>this.handleImage(e)}
                                    type="file"
                                />

                                <Button
                                    variant="contained"
                                    color="default"
                                    size="small"
                                    style={{outline:'none',background:'#FFA500'}}
                                    onClick = {this.triggerUpload}
                                    startIcon={<CloudUploadIcon />}
                                >
                                    Upload
                                </Button>
                                
                                <Alert className = "mt-2" severity="info">
                                    Use an image that has atleast <strong>200x200 pixels.</strong> MAX size is <strong>2MB</strong>
                                </Alert>
                            </div>

                            <hr className="clearfix"/>

                            <div id="personalInfo" className = "full-border">
                                <div className="pi-header pl-2 pt-2 pb-2">
                                    <h4>Personal Info</h4>
                                </div>

                                <div className = "pi-body pl-3 pr-3">
                                    <form id="personalInfoForm">
                                        {
                                            FormInputData[this.state.userType].inputs.map((input,i) => 

                                                <div className={'pi-row' + ((FormInputData[this.state.userType].inputs.length - 1 !== i) ? (' border-b') : (''))} key={i}>
                                                    <div className="col-sm-3 pr-3 pl-0 pt-2 d-flex align-items-center">
                                                            <h5 className="m-0">{input.title}</h5>
                                                        </div>
                                                        <div className="col-sm-9 pl-0 pr-0">
                                                            <MaterialInput
                                                                data={this.state.csc}
                                                                inputId={input.inputId}
                                                                inputValue={(this.state.userType === "user")
                                                                            ? this.state.formData.user[input.inputId]
                                                                            : this.state.formData.company[input.inputId]}
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

                                                                filePath={this.state.path.cvPath}
                                                                getValue={this.handleChange}
                                                                getDate={this.handleDate}
                                                                deleteCVFile={this.deleteCVFile}
                                                            />
                                                    </div>
                                                </div>

                                            )
                                        }           
                                    </form>             
                                </div>

                                <div className="pi-footer pt-2 pb-2">
                                    <div className="col-sm-12 text-center">
                                        <Button
                                            className="m-2"
                                            variant="contained"
                                            color="default"
                                            size="small"
                                            style={{background:"#FFA500"}}
                                            onClick={this.saveProfile}
                                            startIcon={<SaveIcon />}
                                        >
                                            Save
                                        </Button>
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
                
            </div>
        )
    }

}

export default MyProfile;