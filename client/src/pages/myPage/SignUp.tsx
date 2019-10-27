import Amplify, { Auth } from 'aws-amplify';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Menu from '../../components/Menu';
import React, { useState, useEffect, Fragment } from 'react';
import TextField from '@material-ui/core/TextField';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { useHistory, useLocation } from 'react-router-dom';

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

Amplify.configure({
  Auth: {
    region: process.env.REACT_APP_AWS_COGNITO_region,
    userPoolId: process.env.REACT_APP_AWS_COGNITO_userPoolId,
    userPoolWebClientId: process.env.REACT_APP_AWS_COGNITO_userPoolWebClientId,
    mandatorySignIn: true
  }
});

const SignUp = () => {
  const classes = useStyles();

  const location = useLocation();
  useEffect(() => {
    Array.from(document.getElementsByTagName('input')).forEach(inputElement =>
      inputElement.setAttribute('spellcheck', 'false')
    );
  }, [location]);

  const [userName, setUserName] = useState('');
  const [isValidUserName, setIsValidUserName] = useState(false);
  const [isUniqueUsername, setIsUniqueUsername] = useState(true);

  const history = useHistory();

  const inputUserName = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUserName(e.target.value);
  };

  useEffect(() => {
    const userNameCheck = async () => {
      if (userName) {
        await Auth.signIn(userName, 'password').catch(err => {
          err.code === 'UserNotFoundException'
            ? setIsUniqueUsername(true)
            : setIsUniqueUsername(false);
        });
        userName.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/)
          ? setIsValidUserName(true)
          : setIsValidUserName(false);
      }
    };
    userNameCheck();
  }, [userName]);

  const signUp = async () => {
    const passwordGenerator = () => {
      let uint32HexArray = [];
      for (let i = 0; i < 32; i++) {
        uint32HexArray.push(
          crypto.getRandomValues(new Uint32Array(1))[0].toString(16)
        );
      }
      return uint32HexArray.join('');
    };
    const signUpResult = await Auth.signUp(userName, passwordGenerator()).catch(
      err => {
        localStorage.setItem(
          'returnLocation',
          JSON.stringify(location.pathname)
        );
        history.push('/failure/error');
      }
    );
    console.log(signUpResult);
    setUserName('');
  };

  return (
    <Fragment>
      <Menu />
      <Box className={classes.root}>
        <Paper className={classes.paper}>
          <TextField
            className={classes.textField}
            label='Name'
            margin='dense'
            placeholder='e.g.  user_name1,  user_123'
            variant='outlined'
            value={userName}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => inputUserName(e)}
          />
          <Button
            className={classes.button}
            variant='contained'
            size='medium'
            disabled={!isUniqueUsername || !isValidUserName}
            onClick={() => signUp()}
          >
            Sign Up
          </Button>
        </Paper>
      </Box>
    </Fragment>
  );
};

export default SignUp;
