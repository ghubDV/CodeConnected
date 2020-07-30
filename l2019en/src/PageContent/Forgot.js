import React from 'react';
import axios from 'axios';
import './Register.css';
import LogRegInput from '../Components/MainContent/LogRegInput';
import SubmitButton from '../Components/MainContent/SubmitButton';
import AccType from '../Components/MainContent/ToggleAccountType';
import ErrorMsg from '../Components/MainContent/ErrorMsg';
import LoadingBar from 'react-top-loading-bar';
import { faAt,faKey,faRedo,faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';

function SnackbarAlert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class ForgotPassword extends React.Component
{

    constructor(props)
    {
        super(props);
        
        this.getAccType = this.getAccType.bind(this);
        this.getEmail = this.getEmail.bind(this);
        this.getUsername = this.getUsername.bind(this);
        this.getPassword = this.getPassword.bind(this);
        this.getActivationCode = this.getActivationCode.bind(this);
        this.getConfirmPassword = this.getConfirmPassword.bind(this);
        this.resetStateErr = this.resetStateErr.bind(this);
    }

    state = 
    {
        formState: {
            sendEmail: true,
            checkCode: false,
            changePass: false,
        },

        userdata: {
            errShow: 'none',
            errMsg: '',
            accType: '',
            email: '',
            password: '',
            confirmPassword:'',
            activation_code: '',
        },

        fetchBarProgress: 0,
        openSnackbar: false,
    }

    //resetting the state error
    resetStateErr()
    {
        this.setState(prevState => ({
            userdata: {
                ...prevState.userdata,
                errShow: 'none',
                errMsg: ''
            }
        }))
    }

    //add progress to loading bar
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

    //getters for the account type,email,username and password

    getAccType(value)
    {
        this.setState(prevState => ({
            userdata: {
                ...prevState.userdata,
                accType: value
            }
        }))

    }

    getEmail(value)
    {
        this.setState(prevState => ({
            userdata: {
                ...prevState.userdata,
                email: value
            }
        }))

    }

    getUsername(value)
    {
        this.setState(prevState => ({
            userdata: {
                ...prevState.userdata,
                username: value
            }
        }))

    }
    getPassword(value)
    {
        this.setState(prevState => ({
            userdata: {
                ...prevState.userdata,
                password: value
            }
        }))

    }

    getConfirmPassword(value)
    {
        this.setState(prevState => ({
            userdata: {
                ...prevState.userdata,
                confirmPassword: value
            }
        }))
    }

    getActivationCode(value)
    {
        this.setState(prevState => ({
            userdata: {
                ...prevState.userdata,
                activation_code: value
            }
        }))
    }

    checkPwd(pass)
    {

        if(pass.length < 6)
        {
            this.setState(prevState =>({
                userdata: {
                    ...prevState.userdata,
                    errShow: 'block',
                    errMsg: 'Password should have atleast 6 characters!'
                }
            }));

            return false;
        }
        else if(pass.length > 50)
        {
            this.setState(prevState =>({
                userdata: {
                    ...prevState.userdata,
                    errShow: 'block',
                    errMsg: 'Password is too long!'
                }
            }));

            return false;
        }

        //regular expression to check for letters and digits
        else if(pass.search(/\d/) === -1 || pass.search(/[a-zA-Z]/) === -1)
        {
            this.setState(prevState =>({
                userdata: {
                    ...prevState.userdata,
                    errShow: 'block',
                    errMsg: 'Password must contain letters and digits!'
                }
            }));

            return false;
        }

        return true;
    }

    checkEmail(email)
    {
        //RFC2822 standard regular expression that checks email validity
        let exp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        
        if(email.search(exp) === -1)
        {
            this.setState(prevState =>({
                userdata: {
                    ...prevState.userdata,
                    errShow: 'block',
                    errMsg: 'E-mail is not valid!'
                }
            }));

            return false;
        }

        return true;
    }

    //xmlhttp request to php register processing page
    axiosRequest = (type,data) =>
    {
        let postData = data;

        this.addProgress(30);

        axios.post("http://"+ window.location.hostname +":8000/changeUserData.php",postData)
        .then(
            (response) =>
            {
                console.log(response);
                if(type === 'send')
                {
                    if(response.data.sent)
                    {
                        this.setState((prevState) => ({
                            ...prevState,
                            formState:
                            {
                                sendEmail: false,
                                checkCode: true,
                                changePass: false,
                            },
                            userdata:
                            {
                                ...prevState.userdata,
                                errMsg:'',
                                errShow:'none',
                            }
                        }))
                    }
                    else
                    {
                        this.setState((prevState) => ({
                            userdata: {
                                ...prevState.userdata,
                                errShow: 'block',
                                errMsg: 'This email does not exist!'
                            }
                        }))
                    }
                }

                if(type === 'checkActivationCode')
                {
                    if(response.data.isMatch)
                    {
                        this.setState((prevState) => ({
                            ...prevState,
                            formState:
                            {
                                sendEmail: false,
                                checkCode: false,
                                changePass: true,
                            },
                            userdata:
                            {
                                ...prevState.userdata,
                                errMsg:'',
                                errShow:'none',
                            }
                        }))
                    }
                    else
                    {
                        this.setState((prevState) => ({
                            userdata: {
                                ...prevState.userdata,
                                errShow: 'block',
                                errMsg: 'Code does not match',
                            }
                        }))
                    }
                }

                if(type === 'updatePassword')
                {
                    if(response.data)
                    {
                        this.setState({
                            formState:
                            {
                                sendEmail: true,
                                checkCode: false,
                                changePass: false,
                            },

                            userdata: {
                                errShow: 'none',
                                errMsg: '',
                                accType: '',
                                email: '',
                                password: '',
                                confirmPassword:'',
                                activation_code: '',
                            },

                            openSnackbar: true,
                        })
                    }
                    else
                    {
                        this.setState((prevState) => ({
                            userdata: {
                                ...prevState.userdata,
                                errShow: 'block',
                                errMsg: 'There was an error while updating the password!',
                            }
                        }))
                    }
                }

                this.completeProgress();
            }
        )
        .catch(() => {
            this.setState(prevState =>({
                userdata: {
                    ...prevState.userdata,
                    errShow: 'block',
                    errMsg: 'Server error encountered!'
                }
            }));

            this.completeProgress();
        })
    }

    sendCode = (e) =>
    {
        e.preventDefault();

        if(this.state.userdata.accType === '')
        {
            this.setState(prevState =>({
                userdata: {
                    ...prevState.userdata,
                    errShow: 'block',
                    errMsg: 'Account type was not selected!'
                }
            }));

            return;
        }

        else if(!this.checkEmail(this.state.userdata.email))
        {
            return;
        }

        let data = {
            c_email: this.state.userdata.email,
            type: this.state.userdata.accType,
            change: 'send'
        }

        this.axiosRequest("send",data);

    }

    //checking for user input errors
    checkInputError = (e) =>
    {
        e.preventDefault();

        //checking if an account type was selected
        if(this.state.userdata.accType === '')
        {
            this.setState(prevState =>({
                userdata: {
                    ...prevState.userdata,
                    errShow: 'block',
                    errMsg: 'Account type was not selected!'
                }
            }));

            return;
        }

        //password and email check
        else if(!this.checkPwd(this.state.userdata.password))
        {
            return;
        }

        else if(!this.checkEmail(this.state.userdata.email))
        {
            return;
        }

        //if user input is valid
        else
        {
            this.resetStateErr();

            //phpaxios request - register account
            this.axiosRegRequest(this.state.userdata);
        }
    }

    checkActivationCode = (e) =>
    {
        e.preventDefault();

        if(this.state.userdata.activation_code.length !== 10 || this.state.userdata.activation_code.search(/[^A-Za-z0-9]/) !== -1)
        {
            this.setState(prevState =>({
                userdata: {
                    ...prevState.userdata,
                    errShow: 'block',
                    errMsg: 'The code you entered is not valid!'
                }
            }));

            return;
        }

        let data = {
            change: 'checkActivationCode',
            c_email: this.state.userdata.email,
            type: this.state.userdata.accType,
            activation_code: this.state.userdata.activation_code,
        }

        this.axiosRequest("checkActivationCode",data);

    }

    updatePassword = (e) =>
    {
        e.preventDefault();

        if(!this.checkPwd(this.state.userdata.password))
        {
            return;
        }

        if(this.state.userdata.password !== this.state.userdata.confirmPassword)
        {
            this.setState(prevState =>({
                userdata: {
                    ...prevState.userdata,
                    errShow: 'block',
                    errMsg: 'Passwords do not match!'
                }
            }));

            return;
        }

        let data = {
            change: 'forgotChange',
            c_email: this.state.userdata.email,
            type: this.state.userdata.accType,
            n_pass:this.state.userdata.password
        }

        this.axiosRequest("updatePassword",data);
    }

    //function that prevents button submit
    redirectLogin = (e) => 
    {
        e.preventDefault();
        this.props.history.push('/login');
    }

    handleSnackbarClose = () =>
    {
        this.setState({
            openSnackbar:false,
        })
    }

    render()
    {
        return(
            <div className="flex-fullWH-container p-0 justify-content-center align-items-center">
                <div className = "position-absolute">
                    <LoadingBar
                                progress={this.state.fetchBarProgress}
                                height={3}
                                color='#FFA500'
                                onLoaderFinished={() => this.onFetchFinish()}
                    />
                 </div>
                <div id="form-card" className = "card card-responsive">
                    <div id="form-card-header" className="card-header">
                        <h1 className="font-weight-normal lead">
                            Recover your account
                        </h1>
                    </div>

                    <div id="form-card-body" className="card-body">
                        <form>
                            {console.log(this.state)}
                            {
                                (this.state.formState.sendEmail) &&
                                (
                                    <React.Fragment>
                                        <ErrorMsg show={this.state.userdata.errShow} message={this.state.userdata.errMsg} />
                                        <AccType value={this.getAccType} />
                                        <LogRegInput placeholder="e-mail" value={this.getEmail} icon={<FontAwesomeIcon icon={faAt} size="sm"/>} type="email"/>
                                        <SubmitButton submit = {this.sendCode} value="Get code"/>
                                    </React.Fragment>
                                )
                               
                            }
                            {
                                (this.state.formState.checkCode) &&
                                (
                                    <React.Fragment>
                                        <ErrorMsg show={this.state.userdata.errShow} message={this.state.userdata.errMsg} />
                                        <LogRegInput 
                                            placeholder="enter code..." 
                                            descFooter={"The code was sent to " + this.state.userdata.email}
                                            footerColor={"#FFA500"}
                                            value={this.getActivationCode} 
                                            icon={<FontAwesomeIcon icon={faKey} size="sm"/>} 
                                            type="activation_code"
                                        />
                                        <SubmitButton submit = {this.checkActivationCode} value="Check code"/>
                                    </React.Fragment>
                                )
                            }
                            {
                                (this.state.formState.changePass) &&
                                (
                                    <React.Fragment>
                                        <ErrorMsg show={this.state.userdata.errShow} message={this.state.userdata.errMsg} />
                                        <LogRegInput 
                                            placeholder="enter new password..." 
                                            value={this.getPassword} 
                                            icon={<FontAwesomeIcon icon={faLock} size="sm"/>} 
                                            type="password"
                                        />
                                        <LogRegInput 
                                            placeholder="confirm new password..." 
                                            value={this.getConfirmPassword} 
                                            icon={<FontAwesomeIcon icon={faRedo} size="sm"/>} 
                                            type="password"
                                        />
                                        <SubmitButton submit = {this.updatePassword} value="Change"/>
                                    </React.Fragment>
                                )
                            }

                        </form>
                    </div>
                </div>         
                <Snackbar open={this.state.openSnackbar} autoHideDuration={5000} onClose={this.handleSnackbarClose}>
                        <SnackbarAlert onClose={this.handleSnackbarClose} severity="success">
                            Password was updated successfully!
                        </SnackbarAlert>
                </Snackbar>
            </div>
        );
    }
}

export default ForgotPassword;