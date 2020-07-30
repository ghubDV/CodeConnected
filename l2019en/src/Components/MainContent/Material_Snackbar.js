import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const usePrevious = (value) => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function Material_Snackbar({isOpen,severity,message}) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(undefined);
  const mounted = React.useRef();
  const prevOpen = usePrevious(open);

  React.useEffect(() => {
    if (!mounted.current) 
    {
      mounted.current = true;
    } 
    else 
    {
      console.log(prevOpen +" "+ open);
      if(prevOpen !== isOpen)
      {
        setOpen(isOpen);
      }
    }
  },[prevOpen, open, isOpen]);


  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}
