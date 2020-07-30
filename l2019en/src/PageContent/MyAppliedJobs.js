import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Snackbar from '@material-ui/core/Snackbar';
import NotFoundComponent from '../PageContent/404';
import { checkAuth } from '../Components/Functions/Auth';
import PrevNext from '../Components/MainContent/PrevNext';
import Card from '../Components/MainContent/Card';
import Loader from '../Components/MainContent/Loader';
import { Alert, AlertTitle } from '@material-ui/lab';
import './Search.css';

const pageSize = 25;

class AppliedJobs extends React.Component
{

    constructor(props)
    {
        super(props);
        this.scrollStart = React.createRef();
    }

    componentDidMount()
    {
        this._mounted = true;
        this.getAppliedJobsList();
    }

    componentWillUnmount()
    {
        this._mounted = false;
    }

    componentDidUpdate()
    {
        window.scrollTo(0,0);
    }

    _mounted = false;

    state = {
        fetching: false,
        pageStart: 0,
        pageEnd: pageSize,
        pageNext: '',
        pagePrev: 'disabled',
        pagectrl: 'none',
        pageNum : null,
        currPage: null,
        searchResults: [],
        resultsCount: null,
        openSnackbar:false,
    };

    initialState(type)
    {
        return {
                searchby: type,
                fetching: false,
                pageStart: 0,
                pageEnd: pageSize,
                pageNext: '',
                pagePrev: 'disabled',
                pagectrl: 'none',
                pageNum : null,
                currPage: null,
                searchResults: [],
                resultsCount: null
            }
    }

    deleteApplication = (jobID,userprofileID) =>
    {
        checkAuth().then((authorization) => {
            if(this._mounted)
            {
                if(authorization.isValid)
                {
                    let postData = JSON.stringify({
                        request: 'deleteApplication',
                        id: jobID,
                        userprofile: userprofileID,
                        type: "application",
                        inputData:{}
                    });

                    let formData = new FormData();
                    formData.append('data',postData);

                    axios.post("http://"+ window.location.hostname +":8000/handleProfile.php",formData)
                    .then(
                        (response) =>
                        {
                            
                            if(response.data.severity === "success")
                            {
                                this.getAppliedJobsList();
                            }
                            else
                            {

                            }
                        }
                    )
                }
            }
        })
    }

    getAppliedJobsList = () =>
    {
        this.setState({fetching:true});
        
        if(this.props.isAuthenthicated)
        {
            let postData = JSON.stringify({
                request: 'getApplicationsList',
                id: this.props.id,
                type: this.props.type,
                inputData:{}
            });

            let formData = new FormData();
            formData.append('data',postData);

            axios.post("http://"+ window.location.hostname +":8000/handleProfile.php",formData)
            .then(
                (response) =>
                {
                    if(Array.isArray(response.data) && this._mounted)
                    {
                        console.log(response.data)
                        if(response.data.length > pageSize && this._mounted)
                        {
                            this.setState({
                                searchResults: response.data,
                                pagectrl: 'flex',
                                pageStart: 0,
                                pageNext: '',
                                pagePrev: 'disabled',
                                pageEnd: pageSize,
                                pageNum: parseInt(response.data.length/pageSize) + 1,
                                currPage: 1, 
                                resultsCount: response.data.length
                            });
                        }

                        else if(this._mounted)
                        {
                            this.setState({
                                searchResults: response.data,
                                pagectrl: 'none',
                                pageStart: 0,
                                pageEnd: response.data.length,
                                pageNum: 1,
                                currPage: 1,
                                resultsCount: response.data.length
                            });
                        }

                        this.setState({fetching:false});
                    }
                    else if(this._mounted)
                    {
                        this.setState({fetching:false});
                    }
                }
            )
        }

    }

    selectType = (choice) =>
    {
        this.setState({
            searchby : choice
        });
    }

    nextPage = (event) =>
    {
        event.preventDefault();

        if(this.state.resultsCount - this.state.pageEnd >= pageSize)
        {
            this.setState({
                pageStart: this.state.pageEnd,
                pageEnd: this.state.pageEnd + pageSize,
                pagePrev: '',
                currPage: this.state.currPage + 1
            });
        }
        else
        {
            this.setState({
                pageStart: this.state.pageEnd,
                pageEnd: this.state.pageEnd + (this.state.resultsCount - this.state.pageEnd),
                pagePrev: '',
                pageNext: 'disabled',
                currPage: this.state.currPage + 1
            });
        }
        
    } 

    prevPage = (event) =>
    {
        event.preventDefault();

        if(this.state.pageStart - pageSize !== 0)
        {
            this.setState({
                pageStart: this.state.pageStart - pageSize,
                pageEnd: this.state.pageStart,
                pageNext:'',
                currPage: this.state.currPage - 1
            });

        }
        else
        {
            this.setState({
                pageStart: this.state.pageStart - pageSize,
                pageEnd: this.state.pageStart,
                pageNext: '',
                pagePrev:'disabled',
                currPage: this.state.currPage - 1
            });
        }
        
    }

    selectPage = (event) =>
    {
        event.preventDefault();

        let selectedPage = parseInt(event.target.textContent);
        let prev='';
        let next='';

        if(selectedPage === 1)
        {
            prev = 'disabled';
        }
        else if(selectedPage === this.state.pageNum)
        {
            next = 'disabled';
        }

        this.setState({
            pageStart: (selectedPage*pageSize) - pageSize,
            pageEnd: selectedPage*pageSize,
            pageNext: next,
            pagePrev: prev,
            currPage: selectedPage
        });
    }

    handleSnackbarOpen = () =>
    {
        this.setState((prevState) => ({
            ...prevState,
            openSnackbar:true
        }))
    }

    handleSnackbarClose = () =>
    {
        this.setState((prevState) => ({
            ...prevState,
            openSnackbar:false
        }))
    }

    notFound = () =>
    {
        return <NotFoundComponent />;
    }
    

    render()
    {
        return(
            <div className ="container">
                {
                     (this.props.isActive !== "T") &&
                     (
                        <div className="w-100">
                            <Alert severity="error">
                                <AlertTitle>Error!</AlertTitle>
                                You need to activate your account before accessing this page - <strong><Link style = {{textDecoration:'none',color: 'rgb(97, 26, 21)'}} to = '/myaccount'>Activate Here!</Link></strong>
                            </Alert>
                        </div>  
                     )
                }

                {
                    (this.props.type === "company") &&
                    (
                        <div className = "d-flex w-100 h-100">
                            {this.notFound()}
                        </div>
                    )
                }

                {
                    (this.props.type === "user" && this.props.isActive === "T") &&
                    (
                        <React.Fragment>
                            <div className="pt-3 pb-3">
                                <h3>Your applications</h3>
                            </div>

                            <hr className="clearfix"/>

                            {
                                (this.state.fetching === true) ?
                                    <Loader />
                                :
                                this.state.searchResults.slice(this.state.pageStart, this.state.pageEnd).map((searchResult, i) =>
                                    <Card type={this.state.searchby} data={searchResult} deleteApplication={this.deleteApplication} openSnackbar = {this.handleSnackbarOpen} for="appliedJobs" key={i}/>
                                )

                            }

                            <PrevNext show = {this.state.pagectrl}
                                        next={this.nextPage} 
                                        prev={this.prevPage}
                                        selectPage={this.selectPage} 
                                        showNext={this.state.pageNext} 
                                        showPrev={this.state.pagePrev} 
                                        pageCount={this.state.pageNum} 
                                        currentPage={this.state.currPage}
                            />
                        </React.Fragment>
                    )
                }
                   <Snackbar
                        autoHideDuration={5000}
                        anchorOrigin={{ vertical:'bottom',horizontal:'center' }}
                        open={this.state.openSnackbar}
                        onClose={this.handleSnackbarClose}
                        message="Email copied to clipboard!"
                   />
            </div>
        );
    }
}

export default AppliedJobs;