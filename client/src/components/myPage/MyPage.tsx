import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import Typography from '@material-ui/core/Typography';
// import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     root: {
//       // display: 'flex'
//     },
//     paper: {
//       // display: 'flex',
//       // justifyContent: 'center'
//       // alignItems: 'center'
//     }
//   })
// );

const MyPage = () => {
  // const classes = useStyles();

  return (
    <React.Fragment>
      <Box display='flex' alignItems='center' css={{ height: '100vh' }}>
        <Container maxWidth='xs'>
          <Paper>
            <MenuList>
              <MenuItem>
                <Typography variant='h6' gutterBottom>
                  Sign Up
                </Typography>
              </MenuItem>
              <Divider component='li' />
              <MenuItem>
                <Typography variant='h6' gutterBottom>
                  Sign In
                </Typography>
              </MenuItem>
              <Divider component='li' />
              <MenuItem>
                <Typography variant='h6' gutterBottom>
                  Sign Out
                </Typography>
              </MenuItem>
              <Divider component='li' />
              <MenuItem>
                <Typography variant='h6' gutterBottom>
                  Unsubscribe
                </Typography>
              </MenuItem>
            </MenuList>
          </Paper>
        </Container>
      </Box>
    </React.Fragment>
  );
};

export default MyPage;
