import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Menu from '../../components/Menu';
import React, { Fragment } from 'react';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

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

const NotFound = () => {
  const classes = useStyles();

  return (
    <Fragment>
      <Menu />
      <Container>
        <Box className={classes.root}>
          <Typography variant='h1'>Error.</Typography>
        </Box>
      </Container>
    </Fragment>
  );
};

export default NotFound;
