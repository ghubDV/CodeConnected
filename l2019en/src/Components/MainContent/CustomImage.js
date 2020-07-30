import React from 'react';
import Avatar from '@material-ui/core/Avatar';

class CustomImage extends React.Component {
 
    render(){
        return(
            <Avatar 
                style={{boxShadow:'0 0 5px #ccc',width: this.props.w,height: this.props.h}} 
                className={"mb-2" + this.props.className} variant={this.props.shape}  
                src={(typeof this.props.src === "object") ? (this.props.default) : (this.props.src)}
            />         
        );
    }
}

export default CustomImage;