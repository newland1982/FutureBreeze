import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Menu from '../../components/Menu';
import Paper from '@material-ui/core/Paper';
import React, { Fragment, useContext, useEffect, useRef } from 'react';
import { Auth } from 'aws-amplify';
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
    input: {
      display: 'none'
    },
    button: {
      width: '88%',
      minWidth: 240,
      margin: theme.spacing(1)
    }
  })
);

const PostScreen = () => {
  const classes = useStyles();

  const inputRef = useRef<HTMLInputElement>(null);

  const history = useHistory();

  const { user, dispatch } = useContext(UserContext);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.value;
    console.log('selectedfileee', selectedFile);
  };

  useEffect(() => {
    inputRef?.current?.click();
  }, []);

  const signOut = async () => {
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
          <input
            ref={inputRef}
            className={classes.input}
            type='file'
            onChange={handleInputChange}
          />
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

export default PostScreen;
