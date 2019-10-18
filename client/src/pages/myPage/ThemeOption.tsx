import Box from '@material-ui/core/Box';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Icon from '@mdi/react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '../../components/Menu';
import React, { useContext, Fragment } from 'react';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import themeStore from '../../data/themeStore';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { ThemeContext } from '../../contexts/ThemeContext';
import { mdiChevronLeft } from '@mdi/js';
import { mdiChevronRight } from '@mdi/js';
import { useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex'
    },
    searchBox: {
      width: 240,
      margin: '0 auto'
    },
    iconBox: {
      margin: '0 auto'
    },
    chevronLeftIcon: {
      position: 'fixed',
      top: 'calc((100vh - 48px) / 2)',
      left: theme.spacing(0.4)
    },
    chevronRightIcon: {
      position: 'fixed',
      top: 'calc((100vh - 48px) / 2)',
      right: theme.spacing(0.4)
    },
    gridList: {
      [theme.breakpoints.up('xs')]: { width: 636 },
      [theme.breakpoints.up('sm')]: { width: 960 },
      [theme.breakpoints.up('md')]: { width: 1280 },
      [theme.breakpoints.up('lg')]: { width: 1280 },
      [theme.breakpoints.up('xl')]: { width: 1280 },
      height: 'auto',
      paddingRight: 36,
      paddingLeft: 36,
      paddingTop: 12,
      paddingBottom: 48
    },
    gridListTile: {
      cursor: 'pointer'
    }
  })
);
const ThemeOption = () => {
  const classes = useStyles();
  const { theme, dispatch } = useContext(ThemeContext);

  const isXlSize = useMediaQuery(useTheme().breakpoints.up('xl'));
  const isLgSize = useMediaQuery(useTheme().breakpoints.up('lg'));
  const isMdSize = useMediaQuery(useTheme().breakpoints.up('md'));
  const isSmSize = useMediaQuery(useTheme().breakpoints.up('sm'));
  const isXsSize = useMediaQuery(useTheme().breakpoints.up('xs'));
  const cols = () => {
    if (isXlSize) {
      return 6;
    }

    if (isLgSize) {
      return 5;
    }

    if (isMdSize) {
      return 4;
    }

    if (isSmSize) {
      return 3;
    }

    if (isXsSize) {
      return 2;
    }

    return 1;
  };

  let tileData: {
    img: string;
    title: string;
    type: string;
  }[] = themeStore.optionalThemeSetting.backgroundImages;

  return (
    <Fragment>
      <Menu />
      <Box className={classes.chevronLeftIcon}>
        <IconButton size='small'>
          <Icon
            path={mdiChevronLeft}
            size={1}
            color='#FFF'
            style={{
              cursor: 'pointer'
            }}
          />
        </IconButton>
      </Box>
      <Box className={classes.chevronRightIcon}>
        <IconButton size='small'>
          <Icon
            path={mdiChevronRight}
            size={1}
            color='#FFF'
            style={{
              cursor: 'pointer'
            }}
          />
        </IconButton>
      </Box>
      <Box mt={3} mb={2}>
        <Toolbar variant='dense'>
          <Box className={classes.searchBox}>
            <TextField
              margin='dense'
              variant='outlined'
              inputProps={{ 'aria-label': 'bare' }}
              fullWidth
            />
          </Box>
        </Toolbar>
      </Box>
      <div className={classes.root}>
        <GridList
          spacing={6}
          cellHeight={196}
          className={classes.gridList}
          cols={cols()}
        >
          <GridListTile cols={cols()} style={{ height: 'auto' }}></GridListTile>
          {tileData.map(tile => (
            <GridListTile
              className={classes.gridListTile}
              key={tile.img}
              cols={1}
              onClick={() => dispatch({ type: 'SET_THEME', payload: tile })}
              style={{
                display: `${tile.img === theme.imageTheme ? 'none' : 'inline'}`
              }}
            >
              <img src={`../backgroundImage/${tile.img}`} alt={tile.img} />
              <GridListTileBar title={tile.img} />
            </GridListTile>
          ))}
        </GridList>
      </div>
    </Fragment>
  );
};

export default ThemeOption;
