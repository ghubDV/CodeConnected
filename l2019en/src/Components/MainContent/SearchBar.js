import React from 'react';
import ToggleSearch from './ToggleSearch';
import UserInput from './UserInput';
import SearchButton from './SearchButton';
import FilterModal from './FilterModal';
import './SearchBar.css';

class SearchBar extends React.Component
{
    state = {
        searchby: 'Jobs',
        clicked: 'no',
        conn:''
    };

    selectType = (choice) =>
    {
        this.setState({
            searchby : choice
        });

        this.props.getType(choice);
    }

    formSubmit = (event) => {
        event.preventDefault();
    }

    render()
    {
        return(
            <form onSubmit={(event) => this.formSubmit(event)}>
                <div className="d-flex pb-2 pt-2 mb-3 mobileFlex">
      
                        <ToggleSearch selection={this.selectType}/>
                        {
                            this.state.searchby === "Jobs" &&
                            <UserInput placeholder="Search for jobs..." id="jobName" default={this.props.inputValue["jobName"]} getUI={this.props.getUI}/>
                        }      
                        {
                            this.state.searchby === "People" &&
                            (
                                <React.Fragment>
                                    <UserInput placeholder="First Name" id="firstName" default={this.props.inputValue["firstName"]} getUI={this.props.getUI}/>
                                    <UserInput id="lastName" placeholder="Last Name" default={this.props.inputValue["lastName"]} getUI={this.props.getUI}/>
                                </React.Fragment>
                            )
                        }   
                        {
                            this.state.searchby === "Companies" &&
                            (
                                <UserInput placeholder="Company name..." id="companyName" default={this.props.inputValue["companyName"]} getUI={this.props.getUI}/>
                            )
                        }                
                        <SearchButton action={this.props.submitSearch}/>
                </div>

                <FilterModal show = {this.state.searchby === 'Jobs' ? 'd-flex' : 'd-none'} getFilters={this.props.getFilters}/>

                <hr className="clearfix"/>
            </form>           
        );
    }
}

export default SearchBar;