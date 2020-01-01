import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Menu from '../../components/Menu';
import React, { Fragment } from 'react';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: `calc(100vh - 124px)`
    }
  })
);

const Error = () => {
  const classes = useStyles();
  const history = useHistory();

  const goBack = () => {
    const returnLocation = localStorage.getItem('returnLocation');
    if (returnLocation) {
      const parsedReturnLocation = JSON.parse(returnLocation);
      history.push(parsedReturnLocation);
    }
  };

  return (
    <Fragment>
      <Menu />
      <Box onClick={() => goBack()}>
        <Container>
          <Box className={classes.root}>
            <Typography variant='h1'>Error.</Typography>
          </Box>
        </Container>
      </Box>
    </Fragment>
  );
};

export default Error;
