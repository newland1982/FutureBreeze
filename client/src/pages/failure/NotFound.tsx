import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Menu from '../../components/Menu';
import React, { Fragment } from 'react';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme
} from '@material-ui/core/styles';

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
  const isXsSize = useMediaQuery(useTheme().breakpoints.only('xs'));

  const typographyVariant = isXsSize ? 'h2' : 'h1';

  return (
    <Fragment>
      <Menu />
      <Container maxWidth='xl'>
        <Box className={classes.root}>
          <Typography variant={typographyVariant}>Not Found</Typography>
        </Box>
      </Container>
    </Fragment>
  );
};

export default Error;
