import React from 'react';
import { Link } from 'react-router-dom';
import './Register.css';
import LogRegInput from '../Components/MainContent/LogRegInput';
import SubmitButton from '../Components/MainContent/SubmitButton';
import AccType from '../Components/MainContent/ToggleAccountType';
import ErrorMsg from '../Components/MainContent/ErrorMsg';
import LoadingBar from 'react-top-loading-bar';
import { faUser,faLock,faAt,faKey } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class Register extends React.Component
{

    constructor(props)
    {
        super(props);
        
        this.getAccType = this.getAccType.bind(this);
        this.getEmail = this.getEmail.bind(this);
        this.getUsername = this.getUsername.bind(this);
        this.getPassword = this.getPassword.bind(this);
        this.getActivationCode = this.getActivationCode.bind(this);
        this.resetStateErr = this.resetStateErr.bind(this);
    }

    state = 
    {
        responsedata: 
        {
            regResult: undefined,
            actResult: undefined,
            msg: undefined
        },

        userdata: {
            errShow: 'none',
            errMsg: '',
            hasRegistered: false,
            accType: '',
            email: '',
            username: '',
            password: '',
            activation_code: ''
        },

        fetchBarProgress: 0,
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

    getActivationCode(value)
    {
        this.setState(prevState => ({
            userdata: {
                ...prevState.userdata,
                activation_code: value
            }
        }))
    }

    checkUsername(username)
    {
        if(username.length < 3)
        {
            this.setState(prevState =>({
                userdata: {
                    ...prevState.userdata,
                    errShow: 'block',
                    errMsg: 'Username should have atleast 3 characters!'
                }
            }));

            return false;
        }

        else if(username.length > 30)
        {
            this.setState(prevState =>({
                userdata: {
                    ...prevState.userdata,
                    errShow: 'block',
                    errMsg: 'Username is too long!'
                }
            }));

            return false;
        }

        return true;
    }

    //password check
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
    axiosRegRequest(userdata)
    {
        
        const axios = require('axios');
        const url = 'http://'+ window.location.hostname +':8000/exportRegistrationResults.php';

        this.addProgress(30);
    
        //getting the data from db
        axios.post(url,userdata).then(
        (response) => 
        {
            console.log(response.data);
            if(!this.state.userdata.hasRegistered)
            {
                this.setState({
                    responsedata:
                    {
                        regResult: response.data.result,
                        msg: response.data.error
                    }
                })
            }
            else
            {
                this.setState({
                    responsedata:
                    {
                        actResult: response.data.result,
                        msg: response.data.error
                    }
                })
            }

            if(response.data.result === false)
            {
                this.setState(prevState =>({
                    userdata: {
                        ...prevState.userdata,
                        errShow: 'block',
                        errMsg: response.data.error
                    }
                }));
            }
            else
            {
                if(!this.state.userdata.hasRegistered)
                {
                    this.setState(prevState =>({
                        userdata: {
                            ...prevState.userdata,
                            hasRegistered: true
                        }
                    }));
                }
            }
            this.completeProgress();
        })
        .catch(
            error =>
            {
                this.setState(prevState =>({
                    userdata: {
                        ...prevState.userdata,
                        errShow: 'block',
                        errMsg: 'There was an error connecting to the server. Try again later!'
                    }
                }));

                this.completeProgress();

            }
        );

        return;

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

        //checking username length
        else if(!this.checkUsername(this.state.userdata.username))
        {
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
        this.resetStateErr();

        this.axiosRegRequest(this.state.userdata);
    }

    //function that prevents button submit
    redirectLogin = (e) => 
    {
        e.preventDefault();
        this.props.history.push('/login');
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
                            {(!this.state.userdata.hasRegistered) ? ("Sign-Up") : ("Activate your account")}
                        </h1>
                    </div>

                    <div id="form-card-body" className="card-body">
                        <form>
                            {console.log(this.state)}
                            {
                                (!this.state.userdata.hasRegistered) ?

                                (
                                    <React.Fragment>
                                        <ErrorMsg show={this.state.userdata.errShow} message={this.state.userdata.errMsg} />
                                        <AccType value={this.getAccType} />
                                        <LogRegInput placeholder="username" value={this.getUsername} icon={<FontAwesomeIcon icon={faUser} size="sm"/>} type="text"/>
                                        <LogRegInput placeholder="password" value={this.getPassword} icon={<FontAwesomeIcon icon={faLock} size="sm"/>} type="password"/>
                                        <LogRegInput placeholder="e-mail" value={this.getEmail} icon={<FontAwesomeIcon icon={faAt} size="sm"/>} type="email"/>
                                        <SubmitButton submit = {this.checkInputError} value="Register"/>
                                    </React.Fragment>
                                )
                                :
                                (
                                    <React.Fragment>
                                        <ErrorMsg show={this.state.userdata.errShow} message={this.state.userdata.errMsg} />
                            
                                            
                                                <React.Fragment>
                                                    <LogRegInput    placeholder="activation code"
                                                                    label="Enter your activation code"
                                                                    descFooter={(this.state.responsedata.actResult) ? ("Your account was activated") : ("Your activation code was sent to " + this.state.userdata.email)}
                                                                    footerColor={(this.state.responsedata.actResult) ? ("#90EE90") : ("#FFA500")}
                                                                    value={this.getActivationCode} icon={<FontAwesomeIcon icon={faKey} size="sm"/>} 
                                                                    type="text"
                                                    />
                                                    {
                                                        (this.state.responsedata.actResult)
                                                        ?
                                                        (
                                                            <SubmitButton submit = {this.redirectLogin} value="to login"/>
                                                        )
                                                        :
                                                        (
                                                            <SubmitButton submit = {this.checkActivationCode} value="Activate"/>
                                                        )
                                                    }
                                                </React.Fragment>
                                            
                                        
                                    </React.Fragment>
                                )
                            }

                        </form>
                    </div>

                    <div id="form-card-footer" className={"card-footer justify-content-center" + ((!this.state.userdata.hasRegistered) ? ("") : (" d-none"))}>
                        <h6 className="font-weight-normal">
                            Already have an account?  <Link to="/login" style = {{color : '#FFA500', cursor : 'pointer', textDecoration: 'none'}}>Sign-In</Link>
                        </h6>
                    </div>
                </div>         
            
            </div>
        );
    }
}

export default Register;