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

type props = {
  path?: string;
};

const Menu = (props: props) => {
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

  const sideList = () => {
    const linkArray = [
      { name: 'Edit', path: '/user/signin' },
      { name: 'Screens', path: '/user/screens' },
      { name: 'Authcode', path: '/user/changeauthcode' },
      { name: 'Sign Out', path: '/user/signout' }
    ];

    if (props.path) {
      linkArray.splice(0, 0, { name: 'Post', path: `${props.path}` });
    }

    return (
      <div
        className={classes.list}
        role='presentation'
        onClick={toggleDrawer(false)}
        onKeyDown={toggleDrawer(false)}
      >
        <List>
          {[
            { name: 'Sign Up', path: '/user/signup' },
            { name: 'Sign In', path: '/user/signin' },
            { name: 'Themes', path: '/user/themeoption' }
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
          {linkArray.map(link => (
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
          {[{ name: 'Quit', path: '/user/quit' }].map(link => (
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
  };

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
