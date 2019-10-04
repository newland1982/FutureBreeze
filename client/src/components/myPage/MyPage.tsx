import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      // flexGrow: 1
    },
    paper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // padding: theme.spacing(2),
      textAlign: 'center',
      // color: theme.palette.text.secondary,
      width: 240,
      height: 240,
      margin: 'auto'
    }
  })
);

const tileData = [
  {
    title: 'Sign Up'
  },
  {
    title: 'Sign In'
  },
  {
    title: 'Sign out'
  },
  {
    title: 'Unsubscribe'
  },
  {
    title: 'Image'
  }
];

const ThemeOption = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Box display='flex' justifyContent='center' alignItems='center' mt={24}>
        <Container maxWidth='md'>
          <Grid
            container
            direction='row'
            alignContent='center'
            alignItems='center'
            justify='space-around'
            spacing={3}
          >
            {tileData.map(tile => (
              <Grid item key={tile.title} xs={12} sm={4} md={3} lg={3}>
                {/* <Box width={200} height={400}> */}
                <Paper className={classes.paper}>
                  <Typography variant='h4' color='textPrimary'>
                    {tile.title}
                  </Typography>
                </Paper>
                {/* </Box> */}
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </div>
  );
};

export default ThemeOption;
