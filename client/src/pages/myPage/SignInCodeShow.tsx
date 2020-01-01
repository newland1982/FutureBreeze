import Box from '@material-ui/core/Box';
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
      minHeight: 264,
      maxHeight: 360,
      padding: theme.spacing(3, 2)
    },
    display: {
      width: '48%',
      minWidth: 252,
      maxWidth: 360,
      wordWrap: 'break-word'
    }
  })
);

const SignInCodeShow = () => {
  const classes = useStyles();

  const { user } = useContext(UserContext);

  return (
    <Fragment>
      <Menu />
      <Box className={classes.root}>
        <Paper className={classes.paper}>
          <Box className={classes.display}>{user.signInCode}</Box>
        </Paper>
      </Box>
    </Fragment>
  );
};

export default SignInCodeShow;
