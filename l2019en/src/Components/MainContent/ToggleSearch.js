import React from 'react';
import './ToggleSearch.css'

class ToggleSearch extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state ={
            searchby : 'Jobs'
        };
    }

    selectType = (event) => 
    {
        event.preventDefault();
        this.setState({
            searchby : event.target.textContent
        });

        this.props.selection(event.target.textContent);
    }

    render()
    {
        return(
            <div className="btn-group" id="toggleSearch">
                <button type="button" href="/#" className="btn btn-light shadow-none dropdown-toggle search-type" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {this.state.searchby}
                </button>
                <div className="dropdown-menu" id="toggleSearchDrop">
                    <a onClick={(event) => this.selectType(event)} className="dropdown-item" href="/#">Jobs</a>
                    <a onClick={(event) => this.selectType(event)} className="dropdown-item" href="/#">People</a>
                    <a onClick={(event) => this.selectType(event)} className="dropdown-item" href="/#">Companies</a>
                </div>
            </div>
        );
    }
}

export default ToggleSearch;