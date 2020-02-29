import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import LoadingAnimation from '../../components/LoadingAnimation';
import Menu from '../../components/Menu';
import Paper from '@material-ui/core/Paper';
import React, {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
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

const ChangeAuthcode = () => {
  const classes = useStyles();

  const textFieldRef = useRef<HTMLInputElement>(null);
  textFieldRef.current?.setAttribute('spellcheck', 'false');

  const history = useHistory();

  const { user, dispatch } = useContext(UserContext);

  const [oldAuthcode, setOldAuthcode] = useState('');
  const [authcodeIsValid, setAuthcodeIsValid] = useState(false);
  const [
    changeAuthcodeButtonHasBeenClicked,
    setChangeAuthcodeButtonHasBeenClicked
  ] = useState(false);

  const newRandomNumber = useMemo(() => {
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

  const displayNamePrefix = oldAuthcode.slice(-256, -160);
  const displayName = oldAuthcode.slice(0, -256);
  const accountName = `${displayNamePrefix}${displayName}`;

  const oldPassword = oldAuthcode.slice(-256);

  const newPassword = `${displayNamePrefix}${newRandomNumber}`;

  const newAuthcode = `${displayName}${displayNamePrefix}${newRandomNumber}`;

  const executeSetOldAuthcode = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setOldAuthcode(event.target.value);
  };

  useEffect(() => {
    const checkOldAuthcode = async () => {
      if (!oldAuthcode) {
        setAuthcodeIsValid(false);
        return;
      }
      if (!displayName.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/)) {
        setAuthcodeIsValid(false);
        return;
      }
      if (!oldPassword.match(/^[a-f0-9]{256}$/)) {
        setAuthcodeIsValid(false);
        return;
      }
      setAuthcodeIsValid(true);
    };
    checkOldAuthcode();
  }, [oldPassword, oldAuthcode, displayName]);

  const changeAuthcode = async () => {
    setChangeAuthcodeButtonHasBeenClicked(true);

    Amplify.configure({
      Auth: {
        identityPoolId: process.env.REACT_APP_AWS_COGNITO_identityPoolId,
        region: process.env.REACT_APP_AWS_COGNITO_region,
        userPoolId: process.env.REACT_APP_AWS_COGNITO_userPoolId,
        userPoolWebClientId:
          process.env.REACT_APP_AWS_COGNITO_userPoolWebClientId
      }
    });

    try {
      await Auth.signOut();
    } catch {
      history.push('/failure/error');
      return;
    }

    try {
      await Auth.signIn(accountName, oldPassword);
    } catch {
      history.push('/failure/error');
      return;
    }

    try {
      const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
      await Auth.changePassword(
        currentAuthenticatedUser,
        oldPassword,
        newPassword
      );

      dispatch({
        type: 'SET_USER',
        payload: {
          ...user,
          accountName,
          password: newPassword,
          authcode: newAuthcode
        }
      });

      history.push('/user/authcodeshow');
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
          display: `${changeAuthcodeButtonHasBeenClicked ? 'none' : 'inline'}`
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
              value={oldAuthcode}
              onChange={(
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => executeSetOldAuthcode(event)}
            />
            <Button
              className={classes.button}
              variant='contained'
              size='medium'
              disabled={!authcodeIsValid || changeAuthcodeButtonHasBeenClicked}
              onClick={() => changeAuthcode()}
            >
              Change Authcode
            </Button>
          </Paper>
        </Box>
      </div>
      <LoadingAnimation
        hasBeenClicked={changeAuthcodeButtonHasBeenClicked}
        size={124}
        thickness={4}
      />
    </Fragment>
  );
};

export default ChangeAuthcode;
