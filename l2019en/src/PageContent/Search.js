import React from 'react';
import SearchBar from '../Components/MainContent/SearchBar';
import PrevNext from '../Components/MainContent/PrevNext';
import Card from '../Components/MainContent/Card';
import Loader from '../Components/MainContent/Loader';
import './Search.css';

const pageSize = 25;

class SearchPageContent extends React.Component
{

    constructor(props)
    {
        super(props);
        this.scrollStart = React.createRef();
    }

    state = {
        searchby:'Jobs',
        filters: [],
        fetching: false,
        searchValue:
        {
            firstName:'',
            lastName:'',
            jobName:'',
            companyName:'',
        },
        userInput:'',
        pageStart: 0,
        pageEnd: pageSize,
        pageNext: '',
        pagePrev: 'disabled',
        pagectrl: 'none',
        pageNum : null,
        currPage: null,
        searchResults: [],
        resultsCount: null
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

    getUserInput = (event) =>
    {
        let value = event.target.value;
        let id = event.target.id;

        this.setState((prevState) => ({
            searchValue:
            {
                ...prevState.searchValue,
                [id]: value,
            }
        }));
    }

    getType = (searchtype) =>
    {
        this.setState(this.initialState(searchtype));
    }

    getFilters = (filterlist) =>
    {   
        //passing the prepared filterlist to the state
        this.setState((prevState) => ({
            ...prevState,
            filters:filterlist
        }));
    }

    sendSearchRequest = (e) =>
    {
        //xmlhttprequest to the php server
        const axios = require('axios');
        const url = 'http://'+ window.location.hostname + ':8000/exportSearchResults.php';
        const UI = this.state.searchValue;
        const inputData = { UI : this.state.searchValue, searchby:this.state.searchby ,filters: this.state.filters };
        //console.log(inputData); 

        //config post data for axios search request
        if(inputData.searchby === 'People')
        {
            if(UI.firstName === '' && UI.lastName === '')
            {
                return;
            }

            if(UI.firstName !== '')
            {
                inputData.UI.firstName = UI.firstName;
            }

            if(UI.lastName !== '')
            {
                inputData.UI.lastName = UI.lastName;
            }

        }

        else if(inputData.searchby === 'Companies')
        {
            if(UI.comapnyName !== '')
            {
                inputData.UI.companyName = UI.companyName;
            }

            else
            {
                return;
            }
        }

        else
        {
            if(UI.jobName !== '')
            {
                inputData.UI.jobName = UI.jobName;
            }

            else
            {
                return;
            }
        }

        //console.log("xmlhttprequest");
        //console.log(this.state.filters);

        this.setState({fetching:true});
        
        //getting the data from db
        axios.post(url,inputData).then((response) => {
            console.log(response.data)
            if(Array.isArray(response.data))
            {
                if(response.data.length > pageSize)
                this.setState({
                    searchResults: response.data,
                    pagectrl: 'flex',
                    pageStart: 0,
                    pageNext: '',
                    pagePrev: 'disabled',
                    pageEnd: pageSize,
                    pageNum: (response.data.length/pageSize > parseInt(response.data.length/pageSize)) 
                             ? (parseInt(response.data.length/pageSize) + 1)
                             : (parseInt(response.data.length/pageSize)),
                    currPage: 1, 
                    resultsCount: response.data.length
                });

                else
                    this.setState({
                        searchResults: response.data,
                        pagectrl: 'none',
                        pageStart: 0,
                        pageEnd: response.data.length,
                        pageNum: 1,
                        currPage: 1,
                        resultsCount: response.data.length
                    });

                this.setState({fetching:false});
            }
            else
            {
                this.setState({fetching:false});
            }
        
        })


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
        document.body.scroll(0,0);
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
        document.body.scroll(0,0);
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
        document.body.scroll(0,0);
    }

    render()
    {
        return(
            <div className ="container">

                <SearchBar 
                    inputValue = {this.state.searchValue}
                    submitSearch={this.sendSearchRequest} 
                    getUI={this.getUserInput} 
                    getType={this.getType} 
                    getFilters={this.getFilters}
                /> 

                {
                    (this.state.fetching === true) ?
                        <Loader />
                    :
                    this.state.searchResults.slice(this.state.pageStart, this.state.pageEnd).map((searchResult, i) =>
                        <Card type={this.state.searchby} data={searchResult} key={i}/>
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
                
            </div>
        );
    }
}

export default SearchPageContent;