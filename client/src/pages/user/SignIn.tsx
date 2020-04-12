import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import LoadingAnimation from '../../components/LoadingAnimation';
import Menu from '../../components/Menu';
import Paper from '@material-ui/core/Paper';
import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import TextField from '@material-ui/core/TextField';
import Amplify, { Auth } from 'aws-amplify';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { UserContext } from '../../contexts/UserContext';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: `calc(100vh - 112px)`,
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
      padding: theme.spacing(3, 2),
    },
    textField: {
      width: '88%',
      minWidth: 240,
    },
    button: {
      width: '88%',
      minWidth: 240,
      margin: theme.spacing(1),
    },
  })
);

const SignIn = () => {
  const classes = useStyles();

  const textFieldRef = useRef<HTMLInputElement>(null);
  textFieldRef.current?.setAttribute('spellcheck', 'false');

  const history = useHistory();

  const { user, dispatch } = useContext(UserContext);

  const [authcode, setAuthcode] = useState('');
  const [authcodeIsValid, setAuthcodeIsValid] = useState(false);
  const [signInButtonHasBeenClicked, setSignInButtonHasBeenClicked] = useState(
    false
  );

  const displayNamePrefix = authcode.slice(-256, -160);
  const displayName = authcode.slice(0, -256);
  const accountName = `${displayNamePrefix}${displayName}`;

  const password = authcode.slice(-256);

  const executeSetAuthcode = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAuthcode(event.target.value);
  };

  useEffect(() => {
    const validateAuthcode = async () => {
      if (!authcode) {
        setAuthcodeIsValid(false);
        return;
      }
      if (!displayName.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/)) {
        setAuthcodeIsValid(false);
        return;
      }
      if (!password.match(/^[a-f0-9]{256}$/)) {
        setAuthcodeIsValid(false);
        return;
      }
      setAuthcodeIsValid(true);
    };
    validateAuthcode();
  }, [password, authcode, displayName]);

  const signIn = async () => {
    setSignInButtonHasBeenClicked(true);

    Amplify.configure({
      Auth: {
        identityPoolId: process.env.REACT_APP_AWS_COGNITO_identityPoolId,
        region: process.env.REACT_APP_AWS_COGNITO_region,
        userPoolId: process.env.REACT_APP_AWS_COGNITO_userPoolId,
        userPoolWebClientId:
          process.env.REACT_APP_AWS_COGNITO_userPoolWebClientId,
      },
    });

    try {
      await Auth.signOut();
    } catch {
      history.push('/failure/error');
      return;
    }

    try {
      await Auth.signIn(accountName, password);

      dispatch({
        type: 'SET_USER',
        payload: {
          ...user,
          accountName,
          password,
          authcode,
        },
      });

      history.push(user.baseLocation);
    } catch {
      history.push('/failure/error');
      return;
    }
  };

  return (
    <Fragment>
      <Menu />
      <div
        style={{
          display: `${signInButtonHasBeenClicked ? 'none' : 'inline'}`,
        }}
      >
        <Box className={classes.root}>
          <Paper className={classes.paper}>
            <TextField
              ref={textFieldRef}
              className={classes.textField}
              label='Authcode'
              margin='dense'
              variant='outlined'
              value={authcode}
              onChange={(
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => executeSetAuthcode(event)}
            />
            <Button
              className={classes.button}
              variant='contained'
              size='medium'
              disabled={!authcodeIsValid || signInButtonHasBeenClicked}
              onClick={() => signIn()}
            >
              Sign In
            </Button>
          </Paper>
        </Box>
      </div>
      <LoadingAnimation
        isLoading={signInButtonHasBeenClicked}
        size={124}
        thickness={4}
      />
    </Fragment>
  );
};

export default SignIn;
