import React from 'react'
import './PrevNext.css'
import { faAngleRight,faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


class PrevNext extends React.Component
{
    state = {
        compShow: '',
    };

    generatePages()
    {
        let options = [];

        if(this.props.pageNames !== undefined)
        {
            for(let i = 0;i <= this.props.pageCount - 1;i++)
            {
                if(this.props.currentPageName === this.props.pageNames[i])
                {
                    options.push(<a className="pagenav active dropdown-item" href="/#" key={i} onClick={(event) => this.props.selectPage(event,i+1)}>{this.props.pageNames[i]}</a>);
                }
                else
                {
                    options.push(<a className="pagenav dropdown-item" href="/#" key={i} onClick={(event) => this.props.selectPage(event,i+1)}>{this.props.pageNames[i]}</a>);
                }
            }
        }

        else
        {
            for(let i = 1;i <= this.props.pageCount;i++)
            {
                if(this.props.currentPage === i)
                {
                    options.push(<a className="pagenav active dropdown-item" href="/#" key={i} onClick={(e) => this.props.selectPage(e)}>{i}</a>);
                }
                else
                {
                    options.push(<a className="pagenav dropdown-item" href="/#" key={i} onClick={(e) => this.props.selectPage(e)}>{i}</a>);
                }
            }

        }
        return options;
    }

    render()
    {
        return(
            <div className={"d-"+ this.props.show + " pb-2 pt-2 mb-5 justify-content-between"}>
                {
                    (!this.props.disableNextPrev || this.props.disableNextPrev === undefined) &&
                    (
                        <a id="pagectrl" href="/#" onClick = {(e) => this.props.prev(e)} role="button" className={"btn shadow-none anim-orange py-2 " + this.props.showPrev} aria-disabled="true">
                            <FontAwesomeIcon icon={faAngleLeft} size="2x"></FontAwesomeIcon>
                        </a>
                    )
                }
                
                <div className={('dropdown py-2') + ((this.props.fullWidth) ? (' w-100') : (''))}>
                    <button className={('btn btn-light dropdown-toggle shadow-none') + ((this.props.fullWidth) ? (' w-100') : ('')) } id="pageSelectBtn" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {
                            (this.props.pageNames !== undefined) &&
                            (this.props.currentPageName)
                        }
                        {
                            (this.props.pageNames === undefined) &&
                            ('Page ' + this.props.currentPage)
                        }
                    </button>
                    <div className="dropdown-menu" id="pageSelector">
                        {
                            this.generatePages()
                        }
                    </div>
                </div>
                {
                    (!this.props.disableNextPrev || this.props.disableNextPrev === undefined) &&
                    (
                    <a id="pagectrl" href="/#" onClick = {(e) => this.props.next(e)} role="button" className={"btn shadow-none anim-orange py-2 " + this.props.showNext} aria-disabled="true">
                        <FontAwesomeIcon icon={faAngleRight} size="2x"></FontAwesomeIcon>
                     </a>
                    )
                }
            </div>
        );
    }
}

export default PrevNext;