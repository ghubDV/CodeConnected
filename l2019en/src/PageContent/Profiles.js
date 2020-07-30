import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import NotFoundComponent from '../PageContent/404';
import CustomImage from '../Components/MainContent/CustomImage';
import DataCard from  '../Components/MainContent/DataCard';
import fieldTitles from '../Components/MainContent/JSON/showProfileTitles.json';
import './Profiles.css';

class Profiles extends React.Component {

    state = {
        fetchBarProgress:0,
        profileData: {
            user:
            {

            },

            company:
            {

            },

            job:
            {

            }
        }
            
    }

    _mounted = false;

    checkUserExistence()
    {
        let stringArr = this.props.profile_id.split('.');
        let userType = stringArr[0];
        let idName = stringArr[0] + 'profile';
        let id = stringArr[1];
        let formData = new FormData();


        formData.append('data',JSON.stringify({id:id,idType:idName,type:userType,request:'getProfile'}));

        this.addProgress(30);

        axios.post("http://"+ window.location.hostname +":8000/handleProfile.php",formData)
        .then(
            (response) =>
            {
                if(this._mounted)
                {
                    console.log(response.data);

                    if(userType === "user")
                    {
                        this.setState({
                            profileData: {
    
                                files:{
                                    avatar:response.data.avatar
                                },
    
                                user:{
                                    fullName: response.data.firstName + ' ' + response.data.lastName,
                                    description: response.data.description,
                                    profession: response.data.profession,
                                    education: response.data.education,
                                    location: (response.data.country + 
                                              ((response.data.state !== '' && response.data.state !== null)  ? (', ' + response.data.state) : ('')) +
                                              ((response.data.city !== '' && response.data.city !== null) ? (', ' + response.data.city) : (''))),
                                }
                            },
    
                            profileExists: response.data.profileExists,
                            userType: userType
                        })
                    }
                    else{
                        this.setState({
                            profileData: {
    
                                files:{
                                    avatar:response.data.avatar
                                },
    
                                company:{
                                    companyName: response.data.companyName,
                                    founded: response.data.founded,
                                    workDomain: response.data.workDomain,
                                    companyDescription: response.data.companyDescription,
                                    location: (response.data.country + 
                                        ((response.data.state !== '' && response.data.state !== null)  ? (', ' + response.data.state) : ('')) +
                                        ((response.data.city !== '' && response.data.city !== null) ? (', ' + response.data.city) : (''))),
                                    website: response.data.website
                                }
                            },
    
                            profileExists: response.data.profileExists,
                            userType: userType
                        })
                    }
                    this.completeProgress();
                }
            }
        )
    }

    notFound = () => 
    {
        return <NotFoundComponent />;
    }

     //loading
     addProgress = value =>
     {
        this.setState((prevState) => ({
            ...prevState,
            fetchBarProgress: prevState.fetchBarProgress + value
        }))
     }
 
     //complete loading
     completeProgress = () =>
     {
         this.setState((prevState) => ({
            ...prevState,
            fetchBarProgress: 100
        }))
     }
 
     //loading finished
     onFetchFinish = () =>
     {
         this.setState((prevState) => ({
             ...prevState,
             fetchBarProgress: 0
         }))
     }

    componentDidMount()
    {
        this._mounted = true;
        this.checkUserExistence();
    }

    componentWillUnmount()
    {
        this._mounted = false;
    }
    render()
    {
        return(
            <div className="container">
                <div className="position-absolute">
                    <LoadingBar
                        progress={this.state.fetchBarProgress}
                        height={3}
                        color='#FFA500'
                        onLoaderFinished={() => this.onFetchFinish()}
                    />
                </div>
                {
                    (this.state.profileExists === false) &&
                    (
                        <div className = "d-flex w-100 h-100">
                            {this.notFound()}
                        </div>
                    )
                }

                {
                    (this.state.profileExists === true) &&
                    (
                        <div>
                            <div className = "pt-3 pb-3 avatar">

                                <CustomImage w="125px" h="125px" className=" avatar-img" src={this.state.profileData.files.avatar} shape="rounded" default={''} />

                                <h3 className = "text-center">
                                    {
                                        (this.state.userType === "user")
                                        ?
                                        (
                                            this.state.profileData.user.fullName
                                        )
                                        :
                                        (
                                            this.state.profileData.company.companyName
                                        )
                                    }
                                </h3>
                            </div>

                            <hr className="clearfix" />

                            <div id="profileData">
                                {
                                    fieldTitles[this.state.userType + 'Titles'].map((item,index) =>
                                        <DataCard 
                                            title={item.title}
                                            description={this.state.profileData[this.state.userType][item.id]}
                                            link={item.isLink}
                                            key={index}
                                        />
                                    )
                                }
                            </div>

                        </div>
                    )
                }  
            </div>
        );
    }

}

export default withRouter(Profiles);