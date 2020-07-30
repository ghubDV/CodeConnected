import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import NotFoundComponent from '../PageContent/404';
import { checkAuth } from '../Components/Functions/Auth';
import { groupBy } from '../Components/Functions/Other';
import PrevNext from '../Components/MainContent/PrevNext';
import Card from '../Components/MainContent/Card';
import Loader from '../Components/MainContent/Loader';
import { Alert, AlertTitle } from '@material-ui/lab';
import './Search.css';

const pageSize = 1;

class Applicants extends React.Component
{

    constructor(props)
    {
        super(props);
        this.scrollStart = React.createRef();
    }

    componentDidMount()
    {
        this._mounted = true;
        this.getApplicants();
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
    };

    initialState(type)
    {
        return {
                searchby: type,
                fetching: false,
                pageStart: 0,
                pageEnd: pageSize,
                pagectrl: 'none',
                pageNum : null,
                currPage: null,
                searchResults: [],
                resultsCount: null
            }
    }

    setApplicationStatus = (jobID,userprofileID,status) =>
    {
        checkAuth().then((authorization) => {
            if(this._mounted)
            {
                if(authorization.isValid)
                {
                    let postData = JSON.stringify({
                        request: 'setApplicationStatus',
                        id: jobID,
                        userprofile: userprofileID,
                        companyID: authorization.userdata.id,
                        type: "application",
                        status: status,
                        inputData:{}
                    });

                    let formData = new FormData();
                    formData.append('data',postData);

                    console.log(postData);

                    axios.post("http://"+ window.location.hostname +":8000/handleProfile.php",formData)
                    .then(
                        (response) =>
                        {
                            console.log(response.data);
                            if(response.data.severity === "success")
                            {
                                this.getApplicants();
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

    getApplicants = () =>
    {
        this.setState({fetching:true});
        
        if(this.props.isAuthenthicated)
        {
            let postData = JSON.stringify({
                request: 'getApplicants',
                id: this.props.id,
                type: "applicant",
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
                        let groupedResults = groupBy(response.data,"jobName");
                        let numberOfPages = Object.keys(groupedResults).length;

                        if(this._mounted && response.data.length > pageSize)
                        {
                            this.setState({
                                searchResults: groupedResults,
                                pagectrl: 'flex',
                                pageStart: 0,
                                pageEnd: pageSize,
                                pageNum: (numberOfPages/pageSize > parseInt(numberOfPages/pageSize)) 
                                            ? (parseInt(numberOfPages/pageSize) + 1)
                                            : (parseInt(numberOfPages/pageSize)),
                                currPage: 1, 
                                currPageName: Object.keys(groupedResults)[0],
                                resultsCount: response.data.length
                            });
                        }

                        else if(this._mounted)
                        {
                            this.setState({
                                searchResults: groupedResults,
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


    selectPage = (event,pageNum) =>
    {
        event.preventDefault();
        let selectedPage = parseInt(pageNum);

        this.setState({
            pageStart: (selectedPage*pageSize) - pageSize,
            pageEnd: selectedPage*pageSize,
            currPage: selectedPage,
            currPageName: event.target.textContent
        });
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
                    (this.props.type === "user") &&
                    (
                        <div className = "d-flex w-100 h-100">
                            {this.notFound()}
                        </div>
                    )
                }

                {
                    (this.props.type === "company" && this.props.isActive === "T") &&
                    (
                        <React.Fragment>
                            <div className="pt-3 pb-3">
                                <h3>Applicants for your job posts</h3>
                            </div>

                            <hr className="clearfix"/>

                            <PrevNext show = {this.state.pagectrl}
                                        next={this.nextPage} 
                                        prev={this.prevPage}
                                        fullWidth={true}
                                        pageNames={Object.keys(this.state.searchResults)}
                                        disableNextPrev={true}
                                        selectPage={this.selectPage} 
                                        pageCount={this.state.pageNum} 
                                        currentPage={this.state.currPage}
                                        currentPageName={this.state.currPageName}
                            />

                            {
                                (this.state.fetching === true) ?
                                    <Loader />
                                :
                                (

                                    Object.keys(this.state.searchResults).slice(this.state.pageStart, this.state.pageEnd).map((key, index) => (
                                        <React.Fragment key={index}>
                                            <h5 className="pb-3">{key} - <Link className="no-decoration" to={'/jobs/job.' + this.state.searchResults[key][0].job_id}>job details</Link></h5>
                                            {
                                                this.state.searchResults[key].map((searchResult, i) =>
                                                (
                                                    <Card type={this.state.searchby} data={searchResult} setApplicationStatus={this.setApplicationStatus} company_id={this.props.id} for="applicants" key={i}/>
                                                ))
                                            }
                                        </React.Fragment>
                                    ))
                                )

                            }
                        </React.Fragment>
                    )
                }
                
            </div>
        );
    }
}

export default Applicants;