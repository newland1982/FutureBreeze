import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Icon from '@mdi/react';
import IconButton from '@material-ui/core/IconButton';
import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { mdiRectangle } from '@mdi/js';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      top: 'auto',
      bottom: 0
    },
    iconButton: {
      marginRight: theme.spacing(4.2)
    },
    lastIconButton: {
      marginRight: theme.spacing(0)
    }
  })
);

const ThemeOption = () => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <AppBar position='fixed' className={classes.appBar}>
        <Box display='flex' justifyContent='center'>
          <Toolbar>
            <Box display='flex' justifyContent='space-evenly'>
              <IconButton className={classes.iconButton} size='small'>
                <Icon path={mdiRectangle} size={1} color='#FFF' />
              </IconButton>
              <IconButton className={classes.iconButton} size='small'>
                <Icon path={mdiRectangle} size={1} color='#FFF' />
              </IconButton>
              <IconButton className={classes.iconButton} size='small'>
                <Icon path={mdiRectangle} size={1} color='#FFF' />
              </IconButton>
              <IconButton className={classes.iconButton} size='small'>
                <Icon path={mdiRectangle} size={1} color='#FFF' />
              </IconButton>
              <IconButton className={classes.lastIconButton} size='small'>
                <Icon path={mdiRectangle} size={1} color='#FFF' />
              </IconButton>
            </Box>
          </Toolbar>
        </Box>
      </AppBar>
    </React.Fragment>
  );
};

export default ThemeOption;
