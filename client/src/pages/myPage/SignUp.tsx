import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Menu from '../../components/Menu';
import React, { useEffect, Fragment } from 'react';
import TextField from '@material-ui/core/TextField';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: `calc(100vh - 112px)`
    },
    button: {
      width: '88%',
      minWidth: 240,
      margin: theme.spacing(1)
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '0 auto',
      width: '48%',
      minWidth: 276,
      maxWidth: 360,
      height: '48%',
      minHeight: 204,
      maxHeight: 360,
      padding: theme.spacing(3, 2)
    },
    textField: {
      width: '88%',
      minWidth: 240
    }
  })
);
const SignUp = () => {
  const classes = useStyles();

  const location = useLocation();
  useEffect(() => {
    Array.from(document.getElementsByTagName('input')).forEach(inputElement =>
      inputElement.setAttribute('spellcheck', 'false')
    );
  }, [location]);

  return (
    <Fragment>
      <Menu />
      <Box className={classes.root}>
        <Paper className={classes.paper}>
          <TextField
            id='standard-name'
            label='Name'
            className={classes.textField}
            // value={values.name}
            // onChange={handleChange('name')}
            margin='dense'
            placeholder='placeholder'
            variant='outlined'
          />
          <Button
            variant='contained'
            color='secondary'
            size='medium'
            className={classes.button}
          >
            Sign Up
          </Button>
        </Paper>
      </Box>
    </Fragment>
  );
};

export default SignUp;
