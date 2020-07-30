import React from 'react';
import './SubmitButton.css';

class SubmitButton extends React.Component
{
    render()
    {
        return(
           <div className="form-group">
               <input onClick={(e) => this.props.submit(e)} type="submit" value={this.props.value} className="btn shadow-none float-right submit-btn" />
           </div>
        );
    }
}

export default SubmitButton;