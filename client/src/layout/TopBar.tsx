import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@mdi/react';
import MyPageMenu from '../pages/myPage/MyPageMenu';
import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import withWidth, { WithWidth } from '@material-ui/core/withWidth';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { mdiForum, mdiFile, mdiVideo, mdiTelevision } from '@mdi/js';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      marginRight: theme.spacing(2.4)
    },
    lastIcon: {
      marginRight: theme.spacing(0)
    },
    toolbar: {
      paddingRight: 0
    }
  })
);

const TopBar = (props: WithWidth) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Hidden xsDown>
        <AppBar position='fixed'>
          <Container maxWidth='xl'>
            <Box display='flex' justifyContent='flex-end'>
              <Toolbar className={classes.toolbar}>
                <Box className={classes.icon}>
                  <MyPageMenu />
                </Box>
                <Icon
                  className={classes.icon}
                  path={mdiForum}
                  size={1}
                  color='#FFF'
                />
                <Icon
                  className={classes.icon}
                  path={mdiFile}
                  size={1}
                  color='#FFF'
                />
                <Icon
                  className={classes.icon}
                  path={mdiVideo}
                  size={1}
                  color='#FFF'
                />
                <Icon
                  className={classes.lastIcon}
                  path={mdiTelevision}
                  size={1}
                  color='#FFF'
                />
              </Toolbar>
            </Box>
          </Container>
        </AppBar>
      </Hidden>
    </React.Fragment>
  );
};

export default withWidth()(TopBar);
