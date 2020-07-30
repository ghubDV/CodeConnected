import React from 'react';
import './DataCard.css';

const DataCard = ({title,description,link}) =>
{
   const addNewLine = (text) =>
   {
        if(text === null)
        {
            return;
        }
        let newLinedText = text.toString().split('\n').map((item, i) => {
            return <p key={i}>{item}</p>;
        });

        return newLinedText;
   }

   const processLink = (link) =>
   {
        let processedLink = link;

        if(!processedLink.includes('http://') && !processedLink.includes('https://'))
        {
            processedLink = 'http://' + processedLink;
        }

        return processedLink;
   }

   return(
    <div className="dataCard">
        <div className="dataCardtitle">
            <h5 className="font-weight-bold">{title}</h5>
        </div>

        <div className="dataCardproperty">
            {
                (link)
                ?
                (<a target="_blank" rel="noopener noreferrer" href={processLink(description)}>{description}</a>)
                :
                (addNewLine(description))
            }
        </div>
    </div>
   );  
}

export default DataCard;