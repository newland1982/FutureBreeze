import Paper from '@material-ui/core/Paper';
import React from 'react';
import TextField from '@material-ui/core/TextField';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      // [theme.breakpoints.up('sm')]: { marginTop: 120 },
      [theme.breakpoints.down('xs')]: { marginTop: 'auto' }
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '0 auto',
      width: 480,
      height: 240,
      [theme.breakpoints.up('sm')]: { marginTop: 120 },
      // backgroundColor: 'rgba(255, 255, 255, 0.12)',
      padding: theme.spacing(3, 2)
    },
    textField: {
      // display: 'block'
      width: 300
    }
  })
);
const SignUp = () => {
  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      <TextField
        id='standard-name'
        label='Name'
        className={classes.textField}
        // value={values.name}
        // onChange={handleChange('name')}
        margin='normal'
        placeholder='placeholder'
        variant='outlined'
      />
      <TextField
        id='standard-name'
        label='Password'
        className={classes.textField}
        // value={values.name}
        // onChange={handleChange('name')}
        margin='normal'
        variant='outlined'
      />
    </Paper>
  );
};

export default SignUp;
