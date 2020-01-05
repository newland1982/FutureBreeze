import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Menu from '../../components/Menu';
import Paper from '@material-ui/core/Paper';
import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import TextField from '@material-ui/core/TextField';
import { Auth } from 'aws-amplify';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { UserContext } from '../../contexts/UserContext';
import { useHistory, useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: `calc(100vh - 112px)`
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
    },
    button: {
      width: '88%',
      minWidth: 240,
      margin: theme.spacing(1)
    }
  })
);

const SignIn = () => {
  const classes = useStyles();

  const textFieldRef = useRef<HTMLInputElement>(null);
  textFieldRef.current?.setAttribute('spellcheck', 'false');

  const history = useHistory();

  const location = useLocation();

  const { user, dispatch } = useContext(UserContext);

  const [authCode, setAuthCode] = useState('');
  const [isValidAuthCode, setIsValidAuthCode] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const userNamePrefix = authCode.slice(-256, -160);
  const userName = authCode.slice(0, -256);
  const fullUserName = `${userNamePrefix}${userName}`;

  const password = authCode.slice(-256);

  const inputAuthCode = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAuthCode(e.target.value);
  };

  useEffect(() => {
    const authCodeCheck = async () => {
      if (!authCode) {
        setIsValidAuthCode(false);
        return;
      }
      if (!userName.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/)) {
        setIsValidAuthCode(false);
        return;
      }
      if (!password.match(/^[a-f0-9]{256}$/)) {
        setIsValidAuthCode(false);
        return;
      }
      setIsValidAuthCode(true);
    };
    authCodeCheck();
  }, [password, authCode, userName]);

  const signIn = async () => {
    setHasBeenClicked(true);

    try {
      await Auth.signOut();
    } catch {
      localStorage.setItem('returnLocation', JSON.stringify(location.pathname));
      history.push('/failure/error');
      return;
    }

    try {
      await Auth.signIn(fullUserName, password);

      dispatch({
        type: 'SET_USER',
        payload: {
          ...user,
          fullUserName,
          password,
          authCode
        }
      });

      const returnLocation = localStorage.getItem('returnLocation');
      if (returnLocation) {
        const parsedReturnLocation = JSON.parse(returnLocation);
        history.push(parsedReturnLocation);
      }
    } catch {
      localStorage.setItem('returnLocation', JSON.stringify(location.pathname));
      history.push('/failure/error');
      return;
    }
  };

  return (
    <Fragment>
      <Menu />
      <Box className={classes.root}>
        <Paper className={classes.paper}>
          <TextField
            ref={textFieldRef}
            className={classes.textField}
            label='AuthCode'
            margin='dense'
            variant='outlined'
            value={authCode}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => inputAuthCode(e)}
          />
          <Button
            className={classes.button}
            variant='contained'
            size='medium'
            disabled={!isValidAuthCode || hasBeenClicked}
            onClick={() => signIn()}
          >
            Sign In
          </Button>
        </Paper>
      </Box>
    </Fragment>
  );
};

export default SignIn;
