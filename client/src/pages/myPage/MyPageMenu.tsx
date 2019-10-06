import Drawer from '@material-ui/core/Drawer';
import Icon from '@mdi/react';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { mdiAccount } from '@mdi/js';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    list: {
      width: 120,
      paddingTop: '24%'
    }
  })
);

const MyPageMenu = () => {
  const classes = useStyles();
  const [state, setState] = React.useState({
    isOpen: false
  });

  const toggleDrawer = (isOpen: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setState({ isOpen });
  };

  const sideList = () => (
    <div
      className={classes.list}
      role='presentation'
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map(text => (
          <ListItem button key={text}>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <div>
      <IconButton onClick={toggleDrawer(true)} size='small'>
        <Icon path={mdiAccount} size={1} color='#FFF' />
      </IconButton>
      <Drawer
        open={state.isOpen}
        onClose={toggleDrawer(false)}
        transitionDuration={{ enter: 60, exit: 60 }}
      >
        {sideList()}
      </Drawer>
    </div>
  );
};

export default MyPageMenu;
