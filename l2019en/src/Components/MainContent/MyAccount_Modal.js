import React from 'react';
import axios from 'axios';
import { handleLogin } from '../Functions/Auth';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import FormControl from '@material-ui/core/FormControl'
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Fade from '@material-ui/core/Fade';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';


const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(4),
    },
    '& label.Mui-focused': {
        color: '#FFA500',
    },
    '& .MuiOutlinedInput-root': {
        '&.Mui-focused fieldset': {
            borderColor: '#FFA500',
          },
    },
  },
  input: {
    paddingLeft : theme.spacing(1),
    paddingRight : theme.spacing(1),
    },
  label: {
    paddingLeft: theme.spacing(1),
  },
  iconButton: {
    outline: 'none !important',
    color: '#E69500',
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing(1),
  },
  paper: {
    borderRadius: '.3rem',
    backgroundColor: '#FAFAFA',
    boxShadow: theme.shadows[5],

    [theme.breakpoints.down('sm')]: {
        width: '95% !important',
    },
    [theme.breakpoints.up('sm')]: {
        width: '500px !important',
    },
  },
  header: {
    width: '100%',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #dee2e6',
    paddingLeft: theme.spacing(1),
  },
  content: {
    padding: theme.spacing(2,1,2),
  },
  footer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTop: '1px solid #dee2e6',
    padding: theme.spacing(2,1,2),
  },
  closeButton: {
    color: 'red',
    outline: 'none !important',
    float: 'right',
  },
  bottomButton: {
    color: '#FAFAFA',
    backgroundColor: '#E59400',
    outline: 'none !important',
    '&:hover': {
      backgroundColor: '#FFA500',
    },
    margin: theme.spacing(0,1),
  },
}));

const MyAccount_Modal = ({isOpened,title,field,handleClose,currentEmail,accType,getChange}) => {
  const classes = useStyles();

  const [state,setState] = React.useState({
    email: '',
    pass: '',
    error: '',
    validEmail: true,
    validPass: true,
    passForm: {
      currentValid: true,
      newValid: true,
      confirmValid: true,
      currentPass: '',
      newPass: '',
      confirmPass: ''
    }
  });

  const checkPass = (e) =>
  {

    let p = e.target.value;


    //password not valid
    if(e.target.value.length < 6 || e.target.value.length > 50 || e.target.value.search(/\d/) === -1 || e.target.value.search(/[a-zA-Z]/) === -1)
    {
      if(e.target.id === 'pass')
      {
        setState((prevState) => ({
          ...prevState,
          pass : p,
          validPass:false
        }))
      }
      else if(e.target.id === 'current_password')
      {
        setState((prevState) => ({
          ...prevState,
          passForm:
          {
            ...prevState.passForm,
            currentValid: false
          }
        }))
      }
      else if(e.target.id === 'new_password')
      {
        setState((prevState) => ({
          ...prevState,
          passForm:
          {
            ...prevState.passForm,
            newValid: false
          }
        }))
      }
      else if(e.target.id === 'confirm_password')
      {
        setState((prevState) => ({
          ...prevState,
          passForm:
          {
            ...prevState.passForm,
            confirmValid: false
          }
        }))
      }

      return;
    }

    //password is valid
    if(e.target.id === 'pass')
      {
        setState((prevState) => ({
          ...prevState,
          pass : p,
          validPass:true
        }))
      }
      else if(e.target.id === 'current_password')
      {
        setState((prevState) => ({
          ...prevState,
          passForm:
          {
            ...prevState.passForm,
            currentPass: p,
            currentValid: true
          }
        }))
      }
      else if(e.target.id === 'new_password')
      {
        if(state.passForm.currentPass !== p)
        {
          setState((prevState) => ({
            ...prevState,
            passForm:
            {
              ...prevState.passForm,
              newValid: true,
              newPass: p
            }
          }))
        }
        else
        {
          setState((prevState) => ({
            ...prevState,
            passForm:
            {
              ...prevState.passForm,
              newValid: false,
            }
          }))
        }
      }
      else if(e.target.id === 'confirm_password')
      {
        if(e.target.value !== state.passForm.newPass)
        {
          setState((prevState) => ({
            ...prevState,
            passForm:
            {
              ...prevState.passForm,
              confirmValid: false
            }
          }))
        }

        else
        {
          setState((prevState) => ({
            ...prevState,
            passForm:
            {
              ...prevState.passForm,
              confirmValid: true,
              confirmPass: p
            }
          }))
        }
      }

      return;
  }

  const checkEmail = (e) =>
  {
      //RFC2822 standard regular expression that checks email validity
      let exp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
      let em = e.target.value
      
      if(e.target.value.search(exp) === -1)
      {
        setState((prevState) => ({
          ...prevState,
          email: em,
          validEmail:false,
          error: 'Not a valid email address!'
        }))

        return;
      }

      if(e.target.value === currentEmail)
      {
        setState((prevState) => ({
          ...prevState,
          email: em,
          validEmail:false,
          error: 'Unchanged email!'
        }))

        return;
      }
      
      setState((prevState) => ({
        ...prevState,
        email: em,
        validEmail:true,
        error: ''
      }))

      return;
  }

  const closeModal = () =>
  {
    setState({
      email: '',
      pass: '',
      error: '',
      validEmail: true,
      validPass: true,
      passForm: {
        currentValid: true,
        newValid: true,
        confirmValid: true,
        currentPass: '',
        newPass: '',
        confirmPass: ''
      }
    })

    handleClose();
  }

  const changeEmail = () =>
  {
    let postData = {
      c_email: currentEmail,
      n_email: state.email,
      pass: state.pass,
      type: accType,
      change: 'email'
    }

    axios.post('http://'+ window.location.hostname +':8000/changeUserData.php',postData)
        .then(
            (response) => {            
              console.log(response.data);
              handleClose();
              if(!response.data.credentials)
              {
                getChange('email',undefined,false,'error','Wrong credentials entered!');
              }
              else if(!response.data.server || !response.data.jwt)
              {
                getChange('email',undefined,false,'error','There was a server response error!');
              }
              else
              {
                handleLogin(response.data.jwt);
                getChange('email',postData.n_email,true,'success','EMAIL was updated successfully!');
              }
            }
        )
        .catch(
            (error) => {
              getChange('server',undefined,false,'error','Error: ' + error);
            }
        )
  }

  const changePassword = () =>
  {
    let postData = {
      c_email: currentEmail,
      pass: state.passForm.currentPass,
      n_pass: state.passForm.newPass,
      type: accType,
      change: 'password'
    }

    console.log(postData);

    axios.post('http://'+ window.location.hostname +':8000/changeUserData.php',postData)
        .then(
            (response) => {            

              handleClose();
              if(!response.data.credentials)
              {
                getChange('password',undefined,false,'error','Wrong credentials entered!');
              }
              else if(!response.data.server)
              {
                getChange('password',undefined,false,'error','There was a server response error!');
              }
              else
              {
                getChange('password',postData.n_email,true,'success','PASSWORD was updated successfully!');
              }
            }
        )
        .catch(
            (error) => {
              getChange('server',undefined,false,'error','Error: ' + error);
            }
        )
  }

  const changeData = () => 
  {
    if(field === 'email')
    {
      changeEmail();
    } 
    else if (field === 'password')
    {
      changePassword();
    }
  }

  const body = (
    <div className={classes.paper}>
      <div className = {classes.header}>
        <h5 style = {{margin : '0'}} id="modal-title">{title}</h5>
        <IconButton className = {classes.closeButton} onClick = {handleClose} id = "closeModal" aria-label = "close">
            <CloseIcon fontSize = "small"/>
        </IconButton>
      </div>
      <div className = {classes.content}>
      {
        (field === 'email')
        ?
        (
          <form className = {classes.root} noValidate autoComplete="off">
            <FormControl fullWidth className = {classes.input}>
                <TextField id="new_email"
                          label="New email address" 
                          variant="outlined"
                          onChange = {(e) => checkEmail(e)}
                          error = {(state.validEmail) ? (false) : (true)}
                          helperText = {(state.error)}
                          InputLabelProps = {{
                              shrink:true
                          }} 
                />
            </FormControl>
            <FormControl fullWidth className = {classes.input}>
                <TextField id="pass"
                          type="password"
                          label="Password" 
                          variant="outlined" 
                          onChange = {(e) => checkPass(e)}
                          error = {(state.validPass) ? (false) : (true)}
                          helperText={(state.validPass) ? ('') : ('Not Valid!')}
                          InputLabelProps = {{
                              shrink:true
                          }}
                />
            </FormControl>         
          </form>
        )
        :
        (
          <form className = {classes.root} noValidate autoComplete="off">
            <FormControl fullWidth className = {classes.input}>
                <TextField id="current_password"
                          label="Current password" 
                          type="password"
                          variant="outlined"
                          onChange = {(e) => checkPass(e)}
                          error = {(state.passForm.currentValid) ? (false) : (true)}
                          helperText = {(state.passForm.currentValid) ? ('') : ('Not valid!')}
                          InputLabelProps = {{
                              shrink:true
                          }} 
                />
            </FormControl>
            <FormControl fullWidth className = {classes.input}>
                <TextField id="new_password"
                          label="New password" 
                          type="password"
                          variant="outlined"
                          onChange = {(e) => checkPass(e)}
                          error = {(state.passForm.newValid) ? (false) : (true)}
                          helperText = {(state.passForm.newValid) ? ('') : ('Not valid/Not changed!')}
                          InputLabelProps = {{
                              shrink:true
                          }} 
                />
            </FormControl>      
            <FormControl fullWidth className = {classes.input}>
                <TextField id="confirm_password"
                          label="Confirm password" 
                          type="password"
                          variant="outlined"
                          onChange = {(e) => checkPass(e)}
                          error = {(state.passForm.confirmValid) ? (false) : (true)}
                          helperText = {(state.passForm.confirmValid) ? ('') : ('Passwords don\'t match!')}
                          InputLabelProps = {{
                              shrink:true
                          }} 
                />
            </FormControl>     
          </form>
        )
      }
      </div>
      <div className = {classes.footer}>
        {
          (field === 'email')
          ?
          (
            <Button
                variant="contained"
                size="small"
                classes = {{
                    root: classes.bottomButton
                }}
                onClick = {changeData}
                disabled = {(state.validPass && state.validEmail && (state.email !== '' && state.pass !== '')) ? (false) : (true)}
                startIcon={<SaveIcon />}
            >
                Save
            </Button>
          )
          :
          (
            <Button
                variant="contained"
                size="small"
                classes = {{
                    root: classes.bottomButton
                }}
                onClick = {changeData}
                disabled = {(state.passForm.currentValid && state.passForm.newValid && state.passForm.confirmValid && 
                            (state.passForm.currentPass !== '' && state.passForm.newPass !== '' && state.passForm.confirmPass !== '')) 
                            ? 
                            (false) 
                            : 
                            (true)
                           }
                startIcon={<SaveIcon />}
            >
                Save
            </Button>
          )
        }
      </div>
    </div>
  );

  return (
    <div>

      <Modal
        open={isOpened}
        onClose={closeModal}
        className = {classes.modal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
          <Fade in = {isOpened} >
            {body}
          </Fade>
      </Modal>
    </div>
  );
}

export default MyAccount_Modal;