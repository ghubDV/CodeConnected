import React from 'react';
import MyAccountForm from '../Components/MainContent/MyAccountForm';
import MaterialSnackbar from '../Components/MainContent/Material_Snackbar';

class MyAccount extends React.Component{

    state = {
        currentEmail: undefined,
        activationStatus: (this.props.isActive === 'F') ? (false) : (true),
        change: undefined,
        severity: undefined,
        message: undefined
    }

    changeResponse = (from,e,c,s,m) =>
    {
        if(from === 'email')
        {
            this.setState((prevState) => ({
                ...prevState,
                currentEmail: (e === undefined) ? (prevState.currentEmail) : (e),
                activationStatus: (e === undefined) ? (prevState.activationStatus) : (false),
                change: c,
                severity: s,
                message: m
            }))
        }
        else if(from === 'activation')
        {
            this.setState((prevState) => ({
                ...prevState,
                activationStatus: (e === false) ? (prevState.activationStatus) : (true),
                change: c,
                severity: s,
                message: m
            }))
        }
        else
        {
            this.setState((prevState) => ({
                ...prevState,
                change: c,
                severity: s,
                message: m
            }))
        }
    }

    componentDidUpdate()
    {
        console.log(this.state);
    }

    render()
    {
        return(
            <div className = "container">
                <h3>Account Settings</h3>
                <MyAccountForm userEmail = {(this.state.currentEmail === undefined ) ? (this.props.user.email) : (this.state.currentEmail)} 
                               accType = {this.props.type} 
                               activationStatus = {this.state.activationStatus}
                               addProgress = {this.props.addProgress}
                               completeProgress = {this.props.completeProgress}
                               getChange = {this.changeResponse}
                />
                <MaterialSnackbar 
                    isOpen = {(this.state.change === true || this.state.change === false) ? (true) : (false)} 
                    severity = {this.state.severity}
                    message = {this.state.message}
                />
            </div>
        );
    }
}

export default MyAccount;