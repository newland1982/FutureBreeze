import Box from '@material-ui/core/Box';
import Drawer from '@material-ui/core/Drawer';
import Icon from '@mdi/react';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import React, { Fragment } from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import { Link } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { mdiMenu } from '@mdi/js';
import { createMuiTheme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolBar: {
      maxWidth: createMuiTheme().breakpoints.values.xl,
      paddingTop: 16,
      margin: '0 auto'
    },
    list: {
      width: 144,
      paddingTop: '24%'
    },
    listItemText: {
      color: '#FFF'
    }
  })
);

const Menu = () => {
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
          { name: 'Sign In', path: '/mypage/signin' },
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
        <br />
        {[
          { name: 'Edit', path: '/mypage/signin' },
          { name: 'Images', path: '/mypage/images' },
          { name: 'Authcode', path: '/mypage/changeauthcode' },
          { name: 'Sign Out', path: '/mypage/signout' }
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
        <br />
        {[{ name: 'Quit', path: '/mypage/quit' }].map(link => (
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
    <Fragment>
      <Toolbar className={classes.toolBar}>
        <Box
          onClick={toggleDrawer(true)}
          visibility={state.isOpen ? 'hidden' : 'visible'}
          ml={0.04}
        >
          <IconButton size='medium'>
            <Icon
              path={mdiMenu}
              size={1}
              color='#FFF'
              style={{
                cursor: 'pointer'
              }}
            />
          </IconButton>
        </Box>
      </Toolbar>
      <Drawer
        open={state.isOpen}
        onClose={toggleDrawer(false)}
        transitionDuration={{ enter: 60, exit: 60 }}
      >
        {sideList()}
      </Drawer>
    </Fragment>
  );
};

export default Menu;
