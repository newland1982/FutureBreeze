import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
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
    toolBar: {
      maxWidth: 1280,
      marginLeft: 'auto',
      marginRight: 0
    }
  })
);

export default function ButtonAppBar() {
  const classes = useStyles();

  return (
    <div>
      <AppBar position='static'>
        <Toolbar className={classes.toolBar}>
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
          <IconButton className={classes.IconButton} size='small'>
            <Icon path={mdiTelevision} size={1} color='#FFF' />
          </IconButton>
        </Toolbar>
      </AppBar>
    </div>
  );
}
