import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import SideNav from './Components/SideNavbar/SideNav';
import TopNav from './Components/Header/TopNav';
import PageContent from './Components/MainContent/PageContent';
import Footer from './Components/Footer/Footer'

class App extends React.Component
{

    state = {
        modalActive: false
    }

    //page will be blured when modal is active
    modalEffect = (e) => 
    {
        e.preventDefault();

        this.setState({
            modalActive: !this.state.modalActive
        })
    }

    render()
    {
        return (
            <div id="page_wrap">

                <TopNav />

                <div id="body" className="container-fluid">

                    <SideNav />

                    <PageContent modalActive = {this.modalEffect}/>

                    <Footer />
                 
                </div>

            </div>
        );
    }
}

ReactDOM.render(<App />,document.getElementById('root'));