import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiPaper-root' : {
            backgroundColor: '#424242',
        },
        '& .MuiTypography-colorTextSecondary': {
            color: 'rgba(255, 255, 255, 0.7)',
        },
        '& .MuiTypography-h6' : {
            color: '#fff',
        },
        '& .MuiButton-textPrimary' : {
            color: '#90caf9',
        }
    },
}));

export default function AlertDialog({isOpen,title,body,closeDialog,onAccept,onDecline}) {

  const classes = useStyles();

  const handleClose = () => {
    closeDialog();
    onDecline();
  };

  const handleAccept = () => {
    closeDialog();
    onAccept();
  }

  const handleDecline = () =>
  {
    closeDialog();
    onDecline();
  }

  return (
    <div>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className={classes.root}
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {body}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAccept} color="primary">
            Accept
          </Button>
          <Button onClick={handleDecline} color="primary" autoFocus>
            Decline
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}