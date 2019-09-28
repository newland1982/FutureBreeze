import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import withWidth, { WithWidth } from '@material-ui/core/withWidth';
import Icon from '@mdi/react';
import {
  mdiAccount,
  mdiForum,
  mdiFile,
  mdiVideo,
  mdiTelevision
} from '@mdi/js';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      top: 'auto',
      bottom: 0
    },
    iconButton: {
      marginRight: theme.spacing(3.6)
    },
    lastIconButton: {
      marginRight: theme.spacing(0)
    }
  })
);

const BottomBar = (props: WithWidth) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Hidden smUp>
        <AppBar position='static' className={classes.appBar}>
          <Container maxWidth='xl'>
            <Box display='flex' justifyContent='center'>
              <Toolbar>
                <IconButton className={classes.iconButton} size='small'>
                  <Icon path={mdiAccount} size={1} color='#FFF' />
                </IconButton>
                <IconButton className={classes.iconButton} size='small'>
                  <Icon path={mdiForum} size={1} color='#FFF' />
                </IconButton>
                <IconButton className={classes.iconButton} size='small'>
                  <Icon path={mdiFile} size={1} color='#FFF' />
                </IconButton>
                <IconButton className={classes.iconButton} size='small'>
                  <Icon path={mdiVideo} size={1} color='#FFF' />
                </IconButton>
                <IconButton className={classes.lastIconButton} size='small'>
                  <Icon path={mdiTelevision} size={1} color='#FFF' />
                </IconButton>
              </Toolbar>
            </Box>
          </Container>
        </AppBar>
      </Hidden>
    </React.Fragment>
  );
};

export default withWidth()(BottomBar);
