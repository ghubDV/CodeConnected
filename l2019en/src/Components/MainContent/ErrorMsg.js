import React from 'react';
import './ErrorMsg.css';

class ErrorMsg extends React.Component
{
    render()
    {
        return(
           <div className={"form-group d-" + this.props.show}>
               <div className="alert alert-danger" role="alert">
                    {this.props.message}
                </div>
           </div>
        );
    }
}

export default ErrorMsg;