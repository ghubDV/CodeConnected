import React from 'react';
import FilterList from './FilterList';
import MaterialInput from './MaterialInput';
import FilterTypes from './JSON/filterTypes.json';
import CSC from './JSON/countries-states-cities.json';
import './FilterModal.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleRight,faTrash } from '@fortawesome/free-solid-svg-icons';

class FilterModal extends React.Component
{
    state = {
        filterList: [],
        filterListPass: [],
        appliedFilters: 0,

        csc: {
            city: [],
            state: [],
            country: [],
            choice: undefined
        },
    };

    filterItem = (item,key) =>
    {
        if(item.type === "select")
        {
            return(
                <React.Fragment key = {key}>
                    <h5 className="border-bottom py-3">{item.label}</h5>
                    <div className="d-flex flex-column py-2 px-2">
                        <MaterialInput
                            data={this.state.csc}
                            type={item.type}
                            inputId={item.inputId}
                            labelId={item.labelId}
                            helperId={item.helperId}
                            readOnly={item.readOnly}
                            fullWidth={item.fullWidth}
                            label={item.label}
                            placeholder={item.placeholder}
                            getValue={this.handleSelect}
                        />
                    </div>
                </React.Fragment>
            );
        }
        else
        {
            return(
                <FilterList handleChecked = {this.handleChecked} type = {item.type} typeDB = {item.typeDB} key = {key} index = {key} values = {item.values}/>
            );
        }
    }

    getJSONCountries()
    {
        let country = [];
        CSC.map((item) => 
            country.push(item.name)
        )

        this.setState((prevState) => ({
            ...prevState,
            csc:{
                ...prevState.csc,
                country: country,
                state: [],
                city: []
            }
        }))
    }

    getJSONStates(country)
    {
        let states = [];
        let tempChoice;
        CSC.map((item) => {
            if(item.name === country)
            {
                if(item.states === (null || undefined))
                {
                    return false;
                }

                tempChoice = item.states;

                states = Object.keys(item.states);
            }
            return true;
        })

        this.setState((prevState) => ({
            ...prevState,
            csc:{
                ...prevState.csc,
                state: states,
                city: [],
                choice: tempChoice
            }
        }))
    }

    getJSONCities(currentState)
    {
       let cities = this.state.csc.choice;
       this.setState((prevState) => ({
            ...prevState,
            csc:{
                ...prevState.csc,
                city: cities[currentState]
            }
        }))
    }

    handleSelect = (event) =>
    {
        let id = event.target.id;
        let value = event.target.value;
        let targetFilter = {
            type: id,
            name: value
        };
        let newFilterList = this.state.filterList;

        if(id ==="country")
        {
            this.getJSONStates(value);
            newFilterList  = newFilterList.filter(function( obj ) {
                return (obj.type !== ('country'));
            });

            newFilterList  = newFilterList.filter(function( obj ) {
                return (obj.type !== ('state'));
            });

            newFilterList  = newFilterList.filter(function( obj ) {
                return (obj.type !== ('city'));
            });

            newFilterList.push(targetFilter);
        }

        if(id === "state")
        {
            this.getJSONCities(value);
            newFilterList  = newFilterList.filter(function( obj ) {
                return (obj.type !== ('state'));
            });

            newFilterList  = newFilterList.filter(function( obj ) {
                return (obj.type !== ('city'));
            });
            newFilterList.push(targetFilter);
        }

        if(id === "city")
        {
            newFilterList  = newFilterList.filter(function( obj ) {
                return (obj.type !== ('city'));
            });
            newFilterList.push(targetFilter);
        }

        this.setState({
            filterList: newFilterList,
        });

    }

    handleChecked = (event,filterType,filterName) =>
    {
        console.log("add");
        let targetFilter = {
            type: filterType,
            name: filterName
        };

        if(event.target.checked && (filterType === "datePosted") && (this.state.filterList.some(item => item.type === "datePosted")))
        {
            this.setState(prevState => ({
                filterList: prevState.filterList.map((filter) => (filter.type === filterType ? Object.assign({},filter,targetFilter) : filter)),
            }));
        }
        else if(event.target.checked)
        {
            this.setState(prevState => ({
                filterList:[...prevState.filterList,targetFilter]
            }));
        }
        else
        {
            this.setState(prevState => ({
                filterList: prevState.filterList.filter((filter) => filter.name !== filterName)
            }));
        }

    }

    handleRemoveAll = () =>
    {
        console.log("removeall");
        let checkboxes = document.getElementsByTagName('input');
        //resetting all checkboxes
        for(var i = 0; i< checkboxes.length;i++)
        {
            if(checkboxes[i].checked === true)
            {
                checkboxes[i].checked = false;
            }
        }

        //resetting the whole filter list
        this.setState({
            filterList: [],
            appliedFilters: 0
        });

        this.props.getFilters([]);

    }

    applyFilters = () =>
    {

        //passing the filterList from FilterModal->SearchBar->PageContent for the axiosPHP call
        this.props.getFilters(this.state.filterList);

        //setting the appliedFilters count
        this.setState({appliedFilters:this.state.filterList.length});
    }


    //add filterlist clear button
    addClear()
    {
        if(this.state.appliedFilters > 0)
        {
            return (
                <button type="button" id="modalPop" className="btn btn-light shadow-none" onClick = {this.handleRemoveAll}>
                    Clear Filters <span className="badge badge-secondary">{this.state.appliedFilters}</span>
                </button>
            );
        }
    }


    //update filter list
    selectedFilters()
    {
        if(this.state.filterList.length > 0)
        {
            return(
                <React.Fragment>
                    <h5 className="border-bottom py-3">Applied Filters</h5>
                    <div className="d-flex flex-column py-2 px-2">
                        {   
                            this.state.filterList.map((item,i) => 
                                <p className="app-filter text-muted px-2" key = {i}>{item.type + ": " + item.name}</p>
                            )
                        }
                        <button onClick = {(e) => this.handleRemoveAll(e)} type="button" className="btn shadow-none" id="removeAll">
                            Clear All <FontAwesomeIcon icon ={faTrash} />
                        </button>
                    </div>
                </React.Fragment>
            );
        }
    }

    componentDidMount()
    {
        this.getJSONCountries();
    }

    render()
    {
        return(
            <div className= {this.props.show}>
                <button type="button" id="modalPop" className="btn btn-light shadow-none" data-toggle="modal" data-target="#addFilterModal">
                    Add Filters
                    <FontAwesomeIcon icon = {faAngleDoubleRight} className = "ml-2"/>
                </button>

                {this.addClear()}

                <div className="modal fade" id="addFilterModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLongTitle" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="ModalTitle">Add Search Filters</h5>
                                 <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {
                                    //selected filters
                                    this.selectedFilters()
                                }

                                {FilterTypes.filters.map((item,i) => 
                                    this.filterItem(item,i)
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn orange-btn shadow-none" data-dismiss="modal" onClick = {this.applyFilters}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default FilterModal