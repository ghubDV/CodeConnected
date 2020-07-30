import React from 'react';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { orange } from '@material-ui/core/colors';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

const theme = createMuiTheme({
    palette: {
      primary: orange,
    },
});

export default function JobTabs({setDisplayedJobs}) {
  const classes = useStyles();
  const [tabValue, setTabValue] = React.useState(0);



  const handleChange = (event, newValue) => {
    if(newValue === 0)
    {
        setDisplayedJobs('active');
    }
    else
    {
        setDisplayedJobs('inactive');
    }
    setTabValue(newValue);

  };

  return (
    <ThemeProvider theme={theme}>
        <Paper className={classes.root}>
            <Tabs
                value={tabValue}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                centered
            >
                <Tab label="Active Jobs" />
                <Tab label="Disabled Jobs" />
            </Tabs>
        </Paper>
    </ThemeProvider>
  );
}