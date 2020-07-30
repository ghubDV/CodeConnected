import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

class SearchButton extends React.Component
{

    handleClick = (event) =>
    {
        this.props.action(event);
    }

    render()
    {
        return(
            <div className="btn-group">
                <button type="button" onClick={(event) => this.handleClick(event)} className="btn btn-light shadow-none search-type" aria-haspopup="true" aria-expanded="false">
                    <FontAwesomeIcon icon={faSearch}/>
                </button>
            </div>
        );
    }
}

export default SearchButton;