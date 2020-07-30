import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { makeStyles } from '@material-ui/core/styles';
import 'typeface-roboto';

const useStyles = makeStyles((theme) => ({
    menu: {
      backgroundColor: '#4E4E4E',
      color: '#FAFAFA',
      marginTop: theme.spacing(1),
      minWidth: '200px',
    },
    icon: 
    {
        color: '#FAFAFA',
    },
  }));

const MaterialDrop = ({openImg, id, items, func, icons}) => 
{

    const classes = useStyles();

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const renderItemList = (items,func,icons) =>
    {
        var menuItems = [];
        for(let i = 0;i < items.length; i++)
        if(func[i] === null && icons[i] === null)
        {
            menuItems.push(<MenuItem onClick={handleClose} key = {i}>{items[i]}</MenuItem>);
        }
        else if(func[i] === null)
        {
            menuItems.push (
                <MenuItem onClick = {handleClose} key={i}>
                    <ListItemIcon className = {classes.icon}>
                        {icons[i]}
                    </ListItemIcon>
                    <Typography variant="inherit" noWrap>
                            {items[i]}
                    </Typography>
                </MenuItem>
            );
        }
        else if(icons[i] === null)
        {
            menuItems.push(<MenuItem onClick={func[i]} key = {i}>{items[i]}</MenuItem>);
        }
        else
        {
            menuItems.push (
                <MenuItem onClick = {func[i]} key={i}>
                    <ListItemIcon className = {classes.icon}>
                        {icons[i]}
                    </ListItemIcon>
                    <Typography variant="inherit" noWrap>
                            {items[i]}
                    </Typography>
                </MenuItem>
            );
        }

        return menuItems;
    }

    const menuItems = renderItemList(items,func,icons);

    return (
        <div className="float-right">
            <Button style = {{outline : 'none'}} aria-controls={id} aria-haspopup="true" onClick={handleClick}>
                <Avatar variant="rounded" className={classes.rounded}>{openImg}</Avatar>
            </Button>
            <Menu
                id={id}
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                classes={{ paper:classes.menu }}
            >
                {
                    menuItems.map((menuItem,i) =>
                        menuItem
                    )
                }   
            </Menu>
        </div>
    );
}

export default MaterialDrop;