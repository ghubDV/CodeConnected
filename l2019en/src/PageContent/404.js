import React from 'react';
import { withRouter } from 'react-router-dom';
import ButtonBase from '@material-ui/core/ButtonBase';
import "./404.css"

class NotFoundPage extends React.Component
{
    goBack = () =>
    {
        this.props.history.push('/');
    }

    render()
    {
        return(
            <div className="flex-fullWH-container justify-content-center align-items-center">
                <h2 className="mr-3 pr-3 border-right">404</h2>
                <div className="inline-block align-middle">
                    <h2 className="font-weight-normal lead">The page you requested was not found. <ButtonBase style={{marginBottom: '.5rem',color:"#FFA500"}} onClick = {this.goBack}>Go to Home</ButtonBase></h2>
                </div>
            </div>
        );
    }
}

export default withRouter(NotFoundPage);