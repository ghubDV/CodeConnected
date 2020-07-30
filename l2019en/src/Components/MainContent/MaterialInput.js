import React from 'react';
import { makeStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import IconButton from'@material-ui/core/IconButton';
import DescriptionIcon from '@material-ui/icons/Description';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import orange from '@material-ui/core/colors/orange'
import './MaterialInput.css';

const useStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
          marginTop: theme.spacing(3),
          marginBottom: theme.spacing(3),
      },
      '& button:focus' : {
        outline: '0 !important',
      },
    },
    input: {
     '& label.Mui-focused': {
      color: '#FFA500',
     },
      '& .MuiInput-underline:after': {
          borderBottomColor: '#FFA500',
     },
    },
  }));

  const theme = createMuiTheme({
    palette: {
      primary: orange,
    },
  });
  

const MaterialInput = ({data,inputId,labelId,type,helperId,readOnly,fullWidth,multiline,error,label,inputValue,helper,placeholder,getValue,getDate,deleteCVFile,filePath,endAd,startAd}) =>
{
    const classes = useStyles();

    const [currentSelect,setCurrentSelect]=React.useState(placeholder);

    const [currentInput,setCurrentInput]=React.useState(inputValue);

    const [fileName,setFileName]=React.useState(inputValue);

    const [selectedDate,setSelectedDate]=React.useState((inputValue !== "0000-00-00" && inputValue !== "") ? (new Date(inputValue)) : (new Date()))

    const fileInputRef = React.createRef();

    const handleSelectChange = (event) => {
      setCurrentSelect(event.target.value);
      getValue(event);
    }
    const handleInput = (event) => {
      setCurrentInput(event.target.value);
    }

    const handleFile = (event) => {
      if(event.target.files.length === 0)
      {
        return;
      }

      if(event.target.files[0].size > 5242880)
      {
        return;
      }
      
      setFileName(event.target.files[0].name);
      getValue(event);
    }

    const handleDateChange = (date) => {
      setSelectedDate(date);
      getDate(date);
    } 

    const triggerUpload = () => {
      fileInputRef.current.click();
    }

    const deleteFile = () => {
      setFileName('');
      fileInputRef.current.value = '';
      deleteCVFile();
    }

    const textInput = (
        <FormControl error = {error} fullWidth = {fullWidth}>
         <InputLabel id={labelId} htmlFor={inputId} shrink = {true}>{label}</InputLabel>
         <Input id={inputId} 
                aria-describedby={inputId}
                readOnly = {readOnly}
                multiline = {multiline}
                rowsMax="30"
                onChange = {handleInput}
                onBlur = {getValue}
                startAdornment = {
                  startAd
                }
                endAdornment = {
                  endAd
                } 
                placeholder={placeholder}
                value={currentInput}
                />
          <FormHelperText id={helperId}>{helper}</FormHelperText>
        </FormControl>
    )

    const selectInput = (
      <div>
        <div className={(inputValue !== '') ? ("pt-1 pb-3") : ("d-none pt-1 pb-3")}>Current: <strong>{inputValue}</strong></div>
        <div>
          <FormControl fullWidth={fullWidth}>
            <InputLabel htmlFor={inputId}>{label}</InputLabel>
            <Select
              native
              value={currentSelect}
              onChange={handleSelectChange}
              inputProps={{
                name: inputId,
                id: inputId,
              }}
            >
              <option disabled hidden>{placeholder}</option>
              {(data[inputId] === undefined)
                ?
                ({})
                :
                (
                  data[inputId].map((item,index) => 
                    <option key={index}>{item}</option>
                  )
                )
              }
            </Select>
          </FormControl>
        </div>
      </div>
    )

    const fileInput = (
      <div>
        <FormControl fullWidth={fullWidth}>
          <input 
            hidden 
            type="file" 
            id={inputId} 
            accept=".doc,.docx,.ppt,.pptx,.txt,.pdf" 
            onChange={handleFile}
            ref={fileInputRef}
          />
          <div className="d-inline">
            <Button
              variant="contained"
              color="default"
              size="small"
              style={{background:'#FFA500'}}
              onClick = {triggerUpload}
              startIcon={<CloudUploadIcon />}
            >
              Upload file(5MB)
            </Button>
            <IconButton disabled={(fileName === '' || fileName === undefined || fileName === null) ? (true) : (false)} className="ml-2" color="primary" onClick={deleteFile} aria-label="deleteFile">
              <DeleteIcon />
            </IconButton>
          </div>
        </FormControl>
        <p className="m-0 pt-1">
          {(fileName !== '' && fileName !== undefined && fileName !== null) ? (<DescriptionIcon />) : ('')}
          {
            (filePath === undefined || filePath === null || filePath === "")
            ?
            (fileName)
            :
            (<a style={{color:'#fd7e14',textDecoration:'none'}} target="_blank" rel="noopener noreferrer" href={filePath} download={fileName}>{fileName}</a>)
          }
        </p>
      </div>
    )

    const dateInput = (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <FormControl fullWidth={fullWidth}>
          <KeyboardDatePicker
            className={classes.datePicker}
            disableToolbar
            error={error}
            helperText={helper}
            variant="inline"
            format="MM/dd/yyyy"
            margin="normal"
            id={inputId}
            label={label}
            value={selectedDate}
            onChange={handleDateChange}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
          />
        </FormControl>
      </MuiPickersUtilsProvider>
    )

    return(
      <div className={classes.root} >
        <MuiThemeProvider theme={theme}>
            { (type === "text") &&
              textInput
            }

            {
              (type === "select") &&
              selectInput
            }

            {
              (type === "file") &&
              fileInput
            }

            {
              (type === "date") &&
              dateInput
            }
        </MuiThemeProvider>

      </div>
    )
}

export default MaterialInput;