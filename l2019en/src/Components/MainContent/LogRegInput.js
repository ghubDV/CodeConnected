import React from 'react';
import './UserInput.css';
import './LogRegInput.css'

class LogRegInput extends React.Component
{

    getValue = (e) =>
    {
        this.props.value(e.target.value);
    }

    render()
    {
        return(
            <div className="form-group">
                <label htmlFor={this.props.type} style={{color: '#FFA500'}} className={(this.props.label === undefined) ? ("d-none") : ("")}>{this.props.label}</label>
                <div className="input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon">{this.props.icon}</span>
                    </div>
                    <input type={this.props.type} onChange={(e) => this.getValue(e)} id={this.props.type} className="form-control shadow-none user-input" placeholder={this.props.placeholder} aria-label="Username" aria-describedby="basic-addon1" />
                </div>
                <small className={"form-text" + ((this.props.descFooter === undefined) ? ("d-none") : (""))} style={{color: this.props.footerColor}}>{this.props.descFooter}</small>
            </div>
        );
    }
}

export default LogRegInput;