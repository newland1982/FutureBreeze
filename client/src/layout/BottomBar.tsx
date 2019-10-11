import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
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
    appBar: {
      top: 'auto',
      bottom: 0
    },
    toolBar: {
      width: '100%'
    }
  })
);

const BottomBar = (props: WithWidth) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Hidden smUp>
        <AppBar position='fixed' className={classes.appBar}>
          <Toolbar className={classes.toolBar}>
            <Grid container justify='space-around'>
              <MyPageMenu />
              <Icon path={mdiForum} size={1} color='#FFF' />
              <Icon path={mdiFile} size={1} color='#FFF' />
              <Icon path={mdiVideo} size={1} color='#FFF' />
              <Icon path={mdiTelevision} size={1} color='#FFF' />
            </Grid>
          </Toolbar>
        </AppBar>
      </Hidden>
    </React.Fragment>
  );
};

export default withWidth()(BottomBar);
