import React from 'react';
import FilterItem from './FilterItem';

class FilterList extends React.Component
{
    render()
    {
        return(
            <React.Fragment>
                <h5 className="border-bottom py-3">{this.props.type}</h5>
                <div className="d-flex flex-column py-2 px-2">
                  {
                      this.props.values.map((item,i) =>
                        <FilterItem handleChecked = {this.props.handleChecked} type={this.props.type} typeDB = {this.props.typeDB} name={item} key={i} id={this.props.index + "" + i}/>
                      )
                  }
                </div>
            </React.Fragment>
        );
    }
}

export default FilterList;