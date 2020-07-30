import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import './ClearUserInput.css'

class ClearUserInput extends React.Component
{
    clearText = () =>
    {
        document.getElementById('searchField').value = '';
    }

    render()
    {
        return(
            <div className="btn-group" id="clearInput">
                <button type="button" onClick={this.clearText}  className="btn btn-light shadow-none border-0" id="searchType" aria-haspopup="true" aria-expanded="false">
                    <FontAwesomeIcon className="anim-orange" icon={faTimes}/>
                </button>
            </div>
        );
    }
}

export default ClearUserInput;