import React from 'react';
import { Link } from 'react-router-dom';

class SideLink extends React.Component
{
    render()
    {
        return (
            <Link className={'d-flex align-items-center '+ this.props.classN} to={this.props.path} onClick = {this.props.onClick}>{this.props.icon}{this.props.text}</Link>
        );
    }
}

export default SideLink;