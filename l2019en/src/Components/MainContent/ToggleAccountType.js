import React from 'react';
import './ToggleAccountType.css';

class ToggleAccountType extends React.Component
{

    state = {
        accountType: "Choose your account type"
    }

    selectType = (e) => {
        e.preventDefault();

        this.props.value(e.target.textContent);
        
        this.setState({
            accountType: e.target.textContent
        })
    }

    render()
    {
        return(
            <div className="input-group mb-3">
                <button type="button" href="/#" className="btn btn-dark shadow-none dropdown-toggle acc-drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {this.state.accountType}
                </button>
                <div className="dropdown-menu" id="acc-type-drop">
                    <a onClick={(event) => this.selectType(event)} className="dropdown-item" href="/#">Person</a>
                    <a onClick={(event) => this.selectType(event)} className="dropdown-item" href="/#">Company</a>
                </div>
            </div>
        );
    }
}

export default ToggleAccountType;