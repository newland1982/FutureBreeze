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
import { useHistory } from 'react-router-dom';

const makeStylesExecution = makeStyles((theme: Theme) =>
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
  const classes = makeStylesExecution();

  const textFieldRef = useRef<HTMLInputElement>(null);
  textFieldRef.current?.setAttribute('spellcheck', 'false');

  const history = useHistory();

  const { user, dispatch } = useContext(UserContext);

  const [authcode, setAuthcode] = useState('');
  const [authcodeIsValid, setAuthcodeIsValid] = useState(false);
  const [quitButtonHasBeenClicked, setQuitButtonHasBeenClicked] = useState(
    false
  );

  const displayNamePrefix = authcode.slice(-256, -160);
  const displayName = authcode.slice(0, -256);
  const accountName = `${displayNamePrefix}${displayName}`;

  const password = authcode.slice(-256);

  const setAuthcodeExecution = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAuthcode(event.target.value);
  };

  useEffect(() => {
    const authcodeCheck = async () => {
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
    authcodeCheck();
  }, [password, authcode, displayName]);

  const accountDeletion = async () => {
    setQuitButtonHasBeenClicked(true);

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
          authcode
        }
      });

      history.goBack();
    } catch {
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
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => setAuthcodeExecution(event)}
          />
          <Button
            className={classes.button}
            variant='contained'
            size='medium'
            disabled={!authcodeIsValid || quitButtonHasBeenClicked}
            onClick={() => accountDeletion()}
          >
            Quit
          </Button>
        </Paper>
      </Box>
    </Fragment>
  );
};

export default Quit;
