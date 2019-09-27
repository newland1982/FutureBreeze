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
    IconButton: {
      marginRight: theme.spacing(2.4)
    },
    LastIconButton: {
      marginRight: theme.spacing(0)
    },
    Toolbar: {
      paddingRight: 0
    }
  })
);

const TopBar = (props: WithWidth) => {
  const classes = useStyles();

  return (
    <div>
      <Hidden xsDown>
        <AppBar position='static'>
          <Container maxWidth='xl'>
            <Box display='flex' justifyContent='flex-end'>
              <Toolbar className={classes.Toolbar}>
                <IconButton className={classes.IconButton} size='small'>
                  <Icon path={mdiAccount} size={1} color='#FFF' />
                </IconButton>
                <IconButton className={classes.IconButton} size='small'>
                  <Icon path={mdiForum} size={1} color='#FFF' />
                </IconButton>
                <IconButton className={classes.IconButton} size='small'>
                  <Icon path={mdiFile} size={1} color='#FFF' />
                </IconButton>
                <IconButton className={classes.IconButton} size='small'>
                  <Icon path={mdiVideo} size={1} color='#FFF' />
                </IconButton>
                <IconButton className={classes.LastIconButton} size='small'>
                  <Icon path={mdiTelevision} size={1} color='#FFF' />
                </IconButton>
              </Toolbar>
            </Box>
          </Container>
        </AppBar>
      </Hidden>
    </div>
  );
};

export default withWidth()(TopBar);
