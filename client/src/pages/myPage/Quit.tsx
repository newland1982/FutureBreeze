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

const Quit = () => {
  const classes = useStyles();

  const textFieldRef = useRef<HTMLInputElement>(null);
  textFieldRef.current?.setAttribute('spellcheck', 'false');

  const history = useHistory();

  const location = useLocation();

  const { user, dispatch } = useContext(UserContext);

  const [authcode, setAuthcode] = useState('');
  const [isValidAuthcode, setIsValidAuthcode] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const usernamePrefix = authcode.slice(-256, -160);
  const username = authcode.slice(0, -256);
  const fullUsername = `${usernamePrefix}${username}`;

  const password = authcode.slice(-256);

  const inputAuthcode = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAuthcode(e.target.value);
  };

  useEffect(() => {
    const authcodeCheck = async () => {
      if (!authcode) {
        setIsValidAuthcode(false);
        return;
      }
      if (!username.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/)) {
        setIsValidAuthcode(false);
        return;
      }
      if (!password.match(/^[a-f0-9]{256}$/)) {
        setIsValidAuthcode(false);
        return;
      }
      setIsValidAuthcode(true);
    };
    authcodeCheck();
  }, [password, authcode, username]);

  const deleteAccount = async () => {
    setHasBeenClicked(true);

    try {
      await Auth.signOut();
    } catch {
      localStorage.setItem('returnLocation', JSON.stringify(location.pathname));
      history.push('/failure/error');
      return;
    }

    try {
      await Auth.signIn(fullUsername, password);

      dispatch({
        type: 'SET_USER',
        payload: {
          ...user,
          fullUsername,
          password,
          authcode
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
            label='Authcode'
            margin='dense'
            variant='outlined'
            value={authcode}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => inputAuthcode(e)}
          />
          <Button
            className={classes.button}
            variant='contained'
            size='medium'
            disabled={!isValidAuthcode || hasBeenClicked}
            onClick={() => deleteAccount()}
          >
            Quit
          </Button>
        </Paper>
      </Box>
    </Fragment>
  );
};

export default Quit;
