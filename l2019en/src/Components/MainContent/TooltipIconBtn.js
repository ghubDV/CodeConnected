import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import ToolTip from '@material-ui/core/Tooltip';


const TooltipIconBtn = ({tooltip,action,style,id,label,icon}) => 
{
    return(
        <ToolTip title = {tooltip}>
            <IconButton onClick = {action} className = {style} id = {id} aria-label = {label}>
                {icon}
            </IconButton>
        </ToolTip>
    );
}

export default TooltipIconBtn;