import React from 'react';
import './FilterItem.css';

class FilterItem extends React.Component
{
    state = {
        inputType: '',
        identifier: ''
    }

    componentDidMount()
    {
       if(this.props.type === "Date Posted")
       {
           this.setState({
               inputType: 'radio',
           })
       }
       else
       {
            this.setState({
                inputType: 'checkbox',
            }) 
       }
    }

    render()
    {
        return(
            <div className={"custom-control custom-" + this.state.inputType}>
                <input onClick = {(e) => this.props.handleChecked(e,this.props.typeDB,this.props.name)} type={this.state.inputType} className="custom-control-input shadow-none" id={this.props.id} name="filter"/>
                <label className="custom-control-label" htmlFor={this.props.id}>{this.props.name}</label>
            </div>
        );
    }
}

export default FilterItem;