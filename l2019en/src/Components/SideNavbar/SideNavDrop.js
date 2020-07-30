import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import SideLink from './SideLink'
import './SideNavDrop.css';

class SideNavDrop extends React.Component
{
    state = {
        angle : null
    };
    
    rotateIcon = (event) =>
    {
        var btn = document.getElementById(event.currentTarget.id);
        if(btn.classList.contains('collapsed'))
        {
            this.setState({
                angle: null
            });

            btn.style.color = '#CCCCCC';
        }
        else
        {
            this.setState({
                angle: 90
            });

            btn.style.color = '#FFA500';
        }
    }

    render()
    {
        return (
            <React.Fragment>
                <a id={this.props.dropBtnID} onClick={(event) => this.rotateIcon(event)} className="side-nav-item" data-toggle="collapse" href={"#" + this.props.toggleID} role="button" aria-expanded="false" aria-controls="collapseMenu">
                    <span>
                        {this.props.name}
                        <FontAwesomeIcon id="dropIcon" icon={faAngleRight} rotation={this.state.angle} size="lg" style={{float:'right'}}/>
                    </span>
                </a>
                <div className="collapse" id={this.props.toggleID}>
                    <div id="dropMenu">
                        {this.props.linkList.map((name,i) =>
                        <React.Fragment key={i}>
                            {
                                (this.props.linkPath[i] !== null)
                                ?
                                (
                                    <SideLink 
                                        classN="side-nav-item" 
                                        icon={this.props.linkIcons[i]} 
                                        text={name} 
                                        path={this.props.linkPath[i]} 
                                    />
                                )
                                :
                                (
                                    <SideLink 
                                        classN="side-nav-item" 
                                        icon={this.props.linkIcons[i]} 
                                        text={name} 
                                        path="#"
                                        onClick={this.props.linkFunc[i]} 
                                    />
                                )
                            }
                        </React.Fragment>
                        )}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default SideNavDrop;