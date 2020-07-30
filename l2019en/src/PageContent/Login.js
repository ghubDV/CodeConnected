import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Register.css';
import LoadingBar from 'react-top-loading-bar';
import LogRegInput from '../Components/MainContent/LogRegInput';
import ErrorMsg from '../Components/MainContent/ErrorMsg';
import AccType from '../Components/MainContent/ToggleAccountType';
import SubmitButton from '../Components/MainContent/SubmitButton';
import { faUser,faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class Login extends React.Component
{
    state = 
    {
        userdata : 
        {
            username:'',
            password:'',
            accType: '',
            errShow:'none',
            errMsg:'',
        },

        appResponse:{},

    }

    _mounted = false;

    componentDidMount()
    {
        this._mounted = true;
    }

    componentWillUnmount()
    {
        this._mounted = false;
    }

    clearUser()
    {
        this.setState({
            userdata : 
            {
                username:'',
                password:'',
                accType: '',
                errShow:'none',
                errMsg:'',
            }
        })
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

    getAccType = (value) =>
    {
        this.setState(prevState => ({
            userdata: {
                ...prevState.userdata,
                accType: value
            }
        }))

    }

    getUsername = (value) =>
    {
        this.setState(prevState => ({
            userdata: {
                ...prevState.userdata,
                username: value
            }
        }))

    }
    getPassword = (value) =>
    {
        this.setState(prevState => ({
            userdata: {
                ...prevState.userdata,
                password: value
            }
        }))

    }

    checkUsername(username)
    {
        if(username.length < 3 || username.length > 30)
        {
            return false;
        }

        return true;
    }

    checkPwd(pass)
    {

        if(pass.length < 6 || pass.length > 50 || pass.search(/\d/) === -1 || pass.search(/[a-zA-Z]/) === -1)
        {
            return false;
        }

        return true;
    }

    //axios login reaquest
    axiosLogRequest(userdata)
    {
        const url = 'http://'+ window.location.hostname +':8000/checkLoginData.php';

        this.addProgress(30);
    
        //getting the data from db
        axios.post(url,userdata)
        .then(
        (response) => 
        {
            this.completeProgress();
            if(response.data.status && this._mounted)
            {
                //this.clearUser();
                this.props.handleLogin(response.data.jwt);
                this.props.updateAuth();
                this.props.history.push("/");
            }
            else if(this._mounted)
            {
                //wrong user credentials
                this.setState(prevState =>({
                    userdata: {
                        ...prevState.userdata,
                        errShow: 'block',
                        errMsg: 'Wrong username/email or password!'
                    }
                }));
            }
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

            }
        );

        return;

    }

    sendLoginCredentials = (e) =>
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
        }

        //checking if username and password are in the correct format
        else if(!this.checkPwd(this.state.userdata.password) || !this.checkUsername(this.state.userdata.username))
        {
            this.setState(prevState =>({
                userdata: {
                    ...prevState.userdata,
                    errShow: 'block',
                    errMsg: 'Wrong username/email or password!'
                }
            }));
        }

        else
        {
            this.resetStateErr();

            this.axiosLogRequest(this.state.userdata);
        }
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
                            Sign-In
                        </h1>
                    </div>

                    {console.log(this.state.userdata)}
                    <div id="form-card-body" className="card-body">
                        <form>
                            <React.Fragment>
                                <ErrorMsg show={this.state.userdata.errShow} message={this.state.userdata.errMsg} />
                                <AccType value={this.getAccType} />
                                <LogRegInput placeholder="username or email" value={this.getUsername} icon={<FontAwesomeIcon icon={faUser} size="sm"/>} type="text"/>
                                <LogRegInput placeholder="password" value={this.getPassword} icon={<FontAwesomeIcon icon={faLock} size="sm"/>} type="password"/>
                                <SubmitButton submit = {this.sendLoginCredentials} value="Login"/>
                            </React.Fragment> 
                        </form>
                    </div>

                    <div id="form-card-footer" className={"card-footer justify-content-center" + ((!this.state.userdata.hasRegistered) ? ("") : (" d-none"))}>
                        <div>
                            <h6 className="font-weight-normal">
                                Don't have an account?  <Link to="/register" style = {{color : '#FFA500', cursor : 'pointer', textDecoration: 'none'}}>Register</Link>
                            </h6>
                        </div>
                        <div>
                            <h6 className="font-weight-normal">
                                <Link to="/forgot" style = {{color : '#FFA500', cursor : 'pointer', textDecoration: 'none'}}>Forgot your password?</Link>
                            </h6>
                        </div>
                    </div>
                </div>         
            
            </div>
        );
    }
}

export default Login;