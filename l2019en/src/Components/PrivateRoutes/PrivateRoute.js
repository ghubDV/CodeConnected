import React from 'react';
import {checkAuth} from '../Functions/Auth';
import LoadingBar from 'react-top-loading-bar';
import {Route,Redirect,withRouter} from 'react-router-dom';


class PrivateRouteClass extends React.Component
{
    state = {
        isAuthenthicated:false,
        isLoading: true,
        userdata: {},
        fetchBarProgress: 0
    }

    //authorizing user to the private route
    awaitAuthorization = () =>
    {
        this.addProgress(30);
        checkAuth().then((authorization) => {
            console.log("Promise Resolved!");
            this.setState({
                isAuthenthicated:authorization.isValid,
                isLoading:false,
                userdata: authorization.userdata,
                fetchBarProgress:100
            })
        })
    }

    componentDidMount()
    {
        this.awaitAuthorization();
    }

    componentDidUpdate(prevProps)
    {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            this.awaitAuthorization();
        }
    }


    addProgress = value =>
    {
        this.setState({
            fetchBarProgress: this.state.fetchBarProgress + value
        });
    }

    //loading finished
    onFetchFinish = () =>
    {
        this.setState({
            fetchBarProgress: 0
        })
    }


    render() {
        if(this.props.noLog)
        {
            if(this.state.isLoading)
            {
                return <LoadingBar
                            progress={this.state.fetchBarProgress}
                            height={3}
                            color='#FFA500'
                            onLoaderFinished={() => this.onFetchFinish()}
                        />;
            }
            else if(!this.state.isLoading && this.state.isAuthenthicated)
            {
                return <Redirect to = {{pathname:'/', state: {from:this.props.location}}} />
            }
            else
            {
                return <Route path = {this.props.path} component = {this.props.component} />
            }
        }

        else
        {
            if(this.state.isLoading)
            {
                return <LoadingBar
                            progress={this.state.fetchBarProgress}
                            height={3}
                            color='#FFA500'
                            onLoaderFinished={() => this.onFetchFinish()}
                        />;
            }
            else if(!this.state.isLoading && this.state.isAuthenthicated)
            {
                var Component = this.props.component;
                return <Route path = {this.props.path} component = {(props) => <Component {...props} 
                                                                    isAuthenthicated={this.state.isAuthenthicated}
                                                                    id={this.state.userdata.id}
                                                                    type={this.state.userdata.type}  
                                                                    isActive={this.state.userdata.isActive}
                                                                    user={this.state.userdata} /> } />
            }
            else
            {
                return <Redirect to = {{pathname:'/login', state: {from:this.props.location}}} />
            }
        }
    }
}

export default withRouter(props => <PrivateRouteClass {...props} />);