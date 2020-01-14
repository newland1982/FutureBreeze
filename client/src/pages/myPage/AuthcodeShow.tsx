import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Menu from '../../components/Menu';
import Paper from '@material-ui/core/Paper';
import React, { Fragment, useContext } from 'react';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { UserContext } from '../../contexts/UserContext';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: `calc(100vh - 112px)`,
      marginTop: 24,
      marginBottom: 96
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '48%',
      minWidth: 276,
      maxWidth: 360,
      height: 'auto',
      minHeight: 260
    },
    display: {
      wordWrap: 'break-word',
      width: '100%',
      padding: '20px'
    },
    button: {
      width: '24%'
    }
  })
);

const AuthcodeShow = () => {
  const classes = useStyles();

  const { user } = useContext(UserContext);

  const copy = () => {
    const paperElement = document.getElementsByClassName('MuiPaper-root')[0];
    paperElement.removeAttribute('style');

    const textareaElement = document.createElement('textarea');
    textareaElement.textContent = user.authcode;
    const bodyElement = document.getElementsByTagName('body')[0];
    bodyElement.appendChild(textareaElement);
    textareaElement.select();
    document.execCommand('copy');
    bodyElement.removeChild(textareaElement);

    paperElement.setAttribute('style', 'animation: copyToClipboard 60ms 48ms;');
  };

  return (
    <Fragment>
      <Menu />
      <Box className={classes.root}>
        <Paper className={classes.paper}>
          <Box className={classes.display}>{user.authcode}</Box>
          <Box
            mb={2}
            style={{
              display: `${user.authcode ? 'inline' : 'none'}`
            }}
          >
            <Button
              className={classes.button}
              variant='contained'
              size='small'
              onClick={() => copy()}
            >
              Copy
            </Button>
          </Box>
        </Paper>
      </Box>
    </Fragment>
  );
};

export default AuthcodeShow;
