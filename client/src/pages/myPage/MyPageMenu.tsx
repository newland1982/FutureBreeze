import Box from '@material-ui/core/Box';
import Drawer from '@material-ui/core/Drawer';
import Icon from '@mdi/react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import React from 'react';
import { Link } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { mdiAccount } from '@mdi/js';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    list: {
      width: 120,
      paddingTop: '24%'
    },
    listItemText: {
      color: '#FFF'
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
        {[
          { name: 'Sign Up', path: '/mypage/signup' },
          { name: 'Sign In', path: '/mypage/themeoption' },
          { name: 'Themes', path: '/mypage/themeoption' }
        ].map(link => (
          <Link to={link.path} style={{ textDecoration: 'none' }}>
            <ListItem button key={link.name}>
              <ListItemText
                className={classes.listItemText}
                primary={link.name}
              />
            </ListItem>
          </Link>
        ))}
        <br />
        {[
          { name: 'Sign Up', path: '/mypage/signup' },
          { name: 'Sign In', path: '/mypage/themeoption' },
          { name: 'Themes', path: '/mypage/themeoption' }
        ].map(link => (
          <Link
            to={link.path}
            key={link.name}
            style={{ textDecoration: 'none' }}
          >
            <ListItem button>
              <ListItemText
                className={classes.listItemText}
                primary={link.name}
              />
            </ListItem>
          </Link>
        ))}
      </List>
    </div>
  );

  return (
    <div>
      <Box onClick={toggleDrawer(true)}>
        <Icon
          style={{ cursor: 'pointer' }}
          path={mdiAccount}
          size={1}
          color='#FFF'
        />
      </Box>
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
