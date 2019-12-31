import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Menu from '../../components/Menu';
import Paper from '@material-ui/core/Paper';
import React, {
  Fragment,
  useContext,
  useEffect,
  useMemo,
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

const ChangePassword = () => {
  const classes = useStyles();

  const history = useHistory();

  const location = useLocation();
  useEffect(() => {
    Array.from(document.getElementsByTagName('input')).forEach(inputElement =>
      inputElement.setAttribute('spellcheck', 'false')
    );
  }, [location]);

  const { user, dispatch } = useContext(UserContext);

  const [signInCode, setSignInCode] = useState('');
  const [isValidSignInCode, setIsValidSignInCode] = useState(false);

  const userNamePrefix = useMemo(() => {
    let uint32HexArray = [];
    for (let i = 0; i < 12; i++) {
      uint32HexArray.push(
        `00000000${crypto
          .getRandomValues(new Uint32Array(1))[0]
          .toString(16)}`.slice(-8)
      );
    }
    return uint32HexArray.join('');
  }, []);

  const randomNumber = useMemo(() => {
    let uint32HexArray = [];
    for (let i = 0; i < 20; i++) {
      uint32HexArray.push(
        `00000000${crypto
          .getRandomValues(new Uint32Array(1))[0]
          .toString(16)}`.slice(-8)
      );
    }
    return uint32HexArray.join('');
  }, []);

  const newPassword = `${userNamePrefix}${randomNumber}`;

  const inputSignInCode = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSignInCode(e.target.value);
  };

  useEffect(() => {
    const signInCodeCheck = async () => {
      const userName = signInCode.slice(0, -256);
      const password = signInCode.slice(-256);
      if (!signInCode) {
        setIsValidSignInCode(false);
        return;
      }
      if (!userName.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/)) {
        setIsValidSignInCode(false);
        return;
      }
      if (!password.match(/^[a-f0-9]{256}$/)) {
        setIsValidSignInCode(false);
        return;
      }
    };
    signInCodeCheck();
  }, [signInCode]);

  const changePassword = async () => {
    const x = await Auth.currentAuthenticatedUser();
    console.log('xxx', x);
    try {
      const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
      await Auth.changePassword(
        currentAuthenticatedUser,
        user.password,
        newPassword
      );
      console.log('xxx', user);
      //   await Auth.signOut();
      //   dispatch({
      //     type: 'SET_USER',
      //     payload: { fullUserName: '', password: '', signInCode: '' }
      //   });
      //   history.goBack();
    } catch {
      //   localStorage.setItem('returnLocation', JSON.stringify(location.pathname));
      //   history.push('/failure/error');
      return;
    }
  };

  return (
    <Fragment>
      <Menu />
      <Box className={classes.root}>
        <Paper className={classes.paper}>
          <TextField
            className={classes.textField}
            label='Password'
            margin='dense'
            variant='outlined'
            value={signInCode}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => inputSignInCode(e)}
          />
          <Button
            className={classes.button}
            variant='contained'
            size='medium'
            disabled={!isValidSignInCode}
            onClick={() => changePassword()}
          >
            Change Password
          </Button>
        </Paper>
      </Box>
    </Fragment>
  );
};

export default ChangePassword;
