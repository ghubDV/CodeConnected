import React from 'react';
import './UserInput.css';

class UserInput extends React.Component
{
    render()
    {
        return(
            <input defaultValue={this.props.default} onSubmit={(e) => e.preventDefault()} onBlur={(e) => this.props.getUI(e)} type="text" id={this.props.id} className={"form-control shadow-none UserInput " + this.props.className} placeholder={this.props.placeholder}/>
        );
    }
}

export default UserInput;