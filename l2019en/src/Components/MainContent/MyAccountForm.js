import React,{ memo } from 'react';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import { checkAuth,logout,handleLogin } from '../Functions/Auth';
import LoadingBar from 'react-top-loading-bar';
import MyAccountModal from './MyAccount_Modal';
import TooltipIconBtn from './TooltipIconBtn';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import ToolTip from '@material-ui/core/Tooltip';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel'
import IconButton from '@material-ui/core/IconButton';
import CreateIcon from '@material-ui/icons/Create';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import SendIcon from '@material-ui/icons/Send';
import './MyAccountForm.css';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(4),
    },
  },
  input: {
   paddingLeft : theme.spacing(1),
   paddingRight : theme.spacing(1),
   '& label.Mui-focused': {
    color: '#FFA500',
   },
    '& .MuiInput-underline:after': {
        borderBottomColor: '#FFA500',
   },
  },
  errorInput: {
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
  loadingBar: {
    position: 'absolute !important',
  },
}));

const MyAccountForm = ({userEmail,accType,activationStatus,getChange}) => {
  const classes = useStyles();

  const activationInput = React.createRef();

  const [state,setState] = React.useState({
    edit: false,
    fetching: false,
    fetchBarProgress: 0,
    field: '',
    toggleAct:false,
    disableActivate: true,
  });

  //loading
  const addProgress = value =>
  {
      setState((prevState) => ({
        ...prevState,
        fetching:true,
        fetchBarProgress: prevState.fetchBarProgress + value
      }))
  }

  //complete loading
  const completeProgress = () =>
  {
      setState((prevState) => ({
        ...prevState,
        fetching:false,
        fetchBarProgress: 100
      }))
  }

  //loading finished
  const onFetchFinish = () =>
  {
      setState((prevState) => ({
        ...prevState,
        fetchBarProgress: 0
      }))
  }

  const icon = (icon,action,text,id,disabled) => {
     return(
       <ToolTip title = {text}>
         <span>
            <IconButton disabled = {(disabled || disabled===undefined) ? (true) : (false)} onClick = {action} className = {classes.iconButton} id = {id} aria-label = "edit">
              {icon}
            </IconButton>
          </span>
       </ToolTip>
     );
  }

  const checkActivationCode = (e) =>
  {
    if(e.target.value.length !== 10 || e.target.value.search(/[^A-Za-z0-9]/) !== -1)
    {
      setState((prevState) => ({
        ...prevState,
        disableActivate: true,
      }))
    }
    else
    {
      setState((prevState) => ({
        ...prevState,
        disableActivate: false
      }))
    }
  }

  const submitActivation = async (e) =>
  {
    let input = document.getElementById('activation').value;
    addProgress(30);

    checkAuth().then((authorization) => {
      if(authorization.isValid)
      {
        let postData = {
          c_email: authorization.userdata.email,
          type: authorization.userdata.type,
          activation_code: input,
          change: 'activate'
        }

        console.log(postData);

        axios.post('http://'+ window.location.hostname +':8000/changeUserData.php',postData)
          .then(
            (response) => {
              if(response.data.active)
              {
                handleLogin(response.data.jwt);
                getChange('activation',true,true,'success','Your account was successfully activated!');
              }
              else if(!response.data.credentials || !response.data.server)
              {
                getChange('activation',false,false,'error','Wrong credentials or server error!');
              }
              completeProgress();
            }
          )
          .catch(
            (error) => {
              getChange('server',undefined,false,'error','Error: ' + error);
            }
          )
      }
      else
      {
        logout();
      }
    })
    .catch(
      (error) => {
        getChange('server',undefined,false,'error','Error: ' + error);
      }
    )
  }

  const sendCodeEmail = async () =>
  {
    checkAuth().then((authorization) => {
      addProgress(30);
      if(authorization.isValid)
      {
        let postData = {
          c_email: authorization.userdata.email,
          type: authorization.userdata.type,
          change: 'send'
        }
        
        axios.post('http://'+ window.location.hostname +':8000/changeUserData.php',postData)
          .then(
            (response) => {
              if(response.data.sent)
              {
                console.log(response.data.code);
                getChange('sendEmail',undefined,true,'success','Activation code sent to your email!');
              }
              else
              {
                getChange('sendEmail',undefined,false,'error','There was a problem sending the email!');
              }
              completeProgress();
            }
          )
          .catch(
            (error) => {
              getChange('server',undefined,false,'error','Error: ' + error);
            }
          )
      }
      else
      {
        logout();
      }
    })
    .catch(
      (error) => {
        getChange('server',undefined,false,'error','Error: ' + error);
      }
    )
    
  }

  const handleModalEdit = (e) => {

    if(e.currentTarget.id === "editEmail")
    {
      setState({
        edit: true,
        field: 'email'
      });     
    }
    else if(e.currentTarget.id === "editPass")
    {
      setState({
        edit: true,
        field: 'password'
      });   
    }
  }


  const actStatus = 
  (
      (activationStatus)
      ?
      (<span style = {{color:(activationStatus) ? ('green') : ('#cc0000')}}><CheckCircleIcon fontSize="small" /> Active</span>)
      :
      (<span style = {{color:(activationStatus) ? ('green') : ('#cc0000')}}><CancelIcon fontSize="small"/> Not Active</span>)
  )

  const handleClose = () => {
       setState({
        edit: false,
        field: state.field
       });
  }


  return (
    <form className={classes.root} noValidate autoComplete="off">
      <div className={classes.loadingBar}>
        <LoadingBar
          progress={state.fetchBarProgress}
          height={3}
          color='#FFA500'
          onLoaderFinished={() => onFetchFinish()}
        />
      </div>
      <MyAccountModal isOpened = {state.edit} 
                       handleClose = {handleClose} 
                       currentEmail = {userEmail} 
                       accType = {accType} 
                       title={"Change " + state.field}
                       field={state.field}
                       addProgress = {addProgress}
                       completeProgress = {completeProgress}
                       getChange = {getChange}
      />
      <FormControl fullWidth className = {classes.input}>
         <InputLabel className = {classes.label} htmlFor="email" shrink = {true}>Email address</InputLabel>
         <Input id="email" 
                aria-describedby="email-helper-text"
                readOnly
                endAdornment = {
                     icon(<CreateIcon fontSize = "small"/>,handleModalEdit,"change email","editEmail",false)
                } 
                value = {userEmail}/>
         <FormHelperText id="email-helper-text">We'll never share your email.</FormHelperText>
      </FormControl>

      <FormControl fullWidth className = {classes.input}>
         <InputLabel className = {classes.label} htmlFor="pass" shrink = {true}>Password</InputLabel>
         <Input id="password" 
                aria-describedby="pass"
                readOnly
                endAdornment = {
                     icon(<CreateIcon fontSize = "small"/>,handleModalEdit,"change password","editPass",false)
                } 
                value = "(unchanged)"/>
          <FormHelperText id="email-helper-text">The above is just a placeholder.</FormHelperText>
      </FormControl>

      <hr className="clearfix"/>

      <div className={classes.input} style = {{display:'flex',alignItems:'center'}}>  
        <div>
          <h6 className="m-0">Account status: {actStatus}</h6>
        </div>  
        <div className = {(activationStatus) ? ('d-none') :('')} style = {{marginLeft:'auto',order:'2',borderLeft:'1px solid rgba(0,0,0,.1)'}}>
          <TooltipIconBtn
            tooltip = "send email with the code"
            action = {sendCodeEmail}
            style = {classes.iconButton}
            className = "d-inline"
            id = "send_code"
            label = "send_act"
            icon = {<SendIcon fontSize = "small" />}
          />
        </div> 
      </div>

      {(!activationStatus) &&
        (
          <FormControl fullWidth className = {classes.input}>
            <InputLabel className = {classes.label} htmlFor="activation" shrink = {true}>Activation code</InputLabel>
            <Input id="activation" 
                    aria-describedby="activation"
                    onChange = {(e) => checkActivationCode(e)}
                    ref = {activationInput}
                    endAdornment = {
                        icon(<CheckCircleIcon fontSize = "small"/>,submitActivation,"Activate account",null,state.disableActivate)
                    }
                    placeholder="activation code..."/>
            <FormHelperText id="activation-helper-text">Code will be sent to {userEmail}</FormHelperText>
          </FormControl>
        )
      } 
    </form>
  );
}

export default memo(MyAccountForm);