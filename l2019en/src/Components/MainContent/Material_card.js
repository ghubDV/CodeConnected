import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CustomImage from './CustomImage';

const useStyles = makeStyles({
  root: {
    
  },
});

export default function ImgMediaCard({data}) {
  const classes = useStyles();

  const[state,setState] = React.useState({
    
  })

  return (
    <Card className={classes.root}>
      <CardActionArea>

        <CardHeader avatar = {<CustomImage w="125px" h="125px" className="avatar-img" src={data.avatar} default={''} />}>
        </CardHeader>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            Lizard
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
            across all continents except Antarctica
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary">
          View Profile
        </Button>
        <Button size="small" color="primary">
          Learn More
        </Button>
      </CardActions>
    </Card>
  );
}