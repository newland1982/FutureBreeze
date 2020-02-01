import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Menu from '../../components/Menu';
import Paper from '@material-ui/core/Paper';
import React, { Fragment, useContext } from 'react';
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
    button: {
      width: '88%',
      minWidth: 240,
      margin: theme.spacing(1)
    }
  })
);

const SignOut = () => {
  const classes = useStyles();

  const history = useHistory();

  const { user, dispatch } = useContext(UserContext);

  const signOut = async () => {
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
      dispatch({
        type: 'SET_USER',
        payload: { ...user, fullUsername: '', password: '', authcode: '' }
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
          <Button
            className={classes.button}
            variant='contained'
            size='medium'
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </Paper>
      </Box>
    </Fragment>
  );
};

export default SignOut;
