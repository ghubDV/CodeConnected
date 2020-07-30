import React from 'react';
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import CustomImage from './CustomImage';
import Typography from '@material-ui/core/Typography';
import './NotificationList.css' ;

const useStyles = makeStyles((theme) => ({
  menu: {
    width: '100%',
    maxWidth: '36ch',
    [theme.breakpoints.down('sm')] : {
      maxWidth: '32ch'
    },

    [theme.breakpoints.up('sm')] : {
      maxWidth: '36ch'
    },
    backgroundColor: '#4E4E4E',
    color: '#FAFAFA',
    marginTop: '10px',
  },
  list:
  {
    color: '#FAFAFA',
  },
  divider:
  {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  link:
  {
    textDecoration: 'none',
    color: "#FFA500",
    '&:hover': {
      textDecoration: 'none',
      color: "#FFA500",
    },
  },
  inline: {
    display: 'inline',
  },
  title: {
    marginBottom: theme.spacing(1),
  },
  textCenter: {
    textAlign: 'center',
  },
  notificationFooter:
  {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    color: 'rgba(255,255,255,0.5)',
    textAlign:'right',

  }
}));

export default function NotificationsList({anchorEl,handleClose,open,notificationsList}) {
  const classes = useStyles();

  const NotificationTitle = (type,is_read) =>
  {
    if(type === "new application")
    {
        return <Typography className={classes.title}>
                  New Application 
                  {
                    (is_read === '0') &&
                    (<span className="new-label">new</span>)
                  }
              </Typography>;
    }

    if(type === "application updated")
    {
        return <Typography className={classes.title}>
                  Application updated 
                  {
                    (is_read === '0') &&
                    (<span className="new-label">new</span>)
                  }
              </Typography>;
    }
  }

  const NotificationText = (type,sender,status,userprofile_id,job,job_id,companyprofile_id) =>
  {
    if(type === "new application")
    {
        return (
            <React.Fragment>
                <Link to={"/profiles/user." + userprofile_id} className={classes.link}>{sender}</Link> has applied for your <Link to={"/jobs/job." + job_id} className={classes.link}>{job}</Link> job
            </React.Fragment>
        );
    }

    if(type === "application updated")
    {
        return (
            <React.Fragment>
                <Link to={"/profiles/company." + companyprofile_id} className={classes.link}>{sender}</Link> has updated the status of your application for <Link to={"/jobs/job." + job_id} className={classes.link}>{job}</Link> to
                {
                  (status === 'accepted') &&
                  (<span className="indicator indicator-success ml-1">{status}</span>)
                }
                {
                  (status === 'declined') &&
                  (<span className="indicator indicator-error ml-1">{status}</span>)
                }
            </React.Fragment>
        );
    }
  }

  const NoNotifications = () =>
  {
      return(
        <ListItem alignItems="flex-start">
            <ListItemText
                primary="No new notifications!"
            />
        </ListItem>
      );
  }

  const NotificationRow = ({avatar,type,status,senderName,jobName,userprofile_id,companyprofile_id,job_id,created_at,is_read}) =>
  {
      return(
        <React.Fragment>
            <ListItem alignItems="flex-start">
                <ListItemAvatar>
                    <CustomImage src={avatar} shape="rounded" className=" shadow-none"/>
                </ListItemAvatar>
                <ListItemText
                primary={NotificationTitle(type,is_read)}
                secondary={
                    <React.Fragment>
                    <Typography
                        component="span"
                        variant="body2"
                        className={classes.inline}
                        style={{color:"#FAFAFA"}}
                    >
                        {NotificationText(type,senderName,status,userprofile_id,jobName,job_id,companyprofile_id)}
                    </Typography>

                    </React.Fragment>
                }
                />
            </ListItem>

            <Typography className={classes.notificationFooter} variant="caption" display="block" gutterBottom>
                  {
                    moment(
                              momentTimezone.tz(created_at + "+0000", Intl.DateTimeFormat().resolvedOptions().timeZone).format()
                    ).fromNow()
                  }
            </Typography>
            <Divider className={classes.divider} />    
        </React.Fragment>
      );
  }

  return (
    <Menu
        id="notification-list"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        keepMounted
        open={open}
        onClose={handleClose}
        classes={{ paper:classes.menu }}
      >
        <List>
            {
                (notificationsList.length >= 1) &&
                (
                    notificationsList.map((notification,key) => 
                        <NotificationRow 
                            avatar = {notification.sender_avatar}
                            type = {notification.notification_type}
                            senderName = {notification[notification.sender + 'Name']}
                            jobName = {notification.jobName}
                            userprofile_id = {notification.userprofile_id}
                            companyprofile_id = {notification.companyprofile_id}
                            job_id = {notification.job_id}
                            created_at = {notification.created_at}
                            is_read = {notification.is_read}
                            status = {notification.status}
                            key={key}
                        />
                    )
                )
            }
            {
                (notificationsList.length < 1) &&
                (<NoNotifications />)
            }
        </List>
    </Menu>
  );
}