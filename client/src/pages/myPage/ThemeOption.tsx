import Box from '@material-ui/core/Box';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Icon from '@mdi/react';
import Menu from '../../components/Menu';
import React, { useContext, Fragment } from 'react';
// import TextField from '@material-ui/core/TextField';
import themeStore from '../../data/themeStore';
import Toolbar from '@material-ui/core/Toolbar';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { ThemeContext } from '../../contexts/ThemeContext';
import { mdiChevronLeft } from '@mdi/js';
import { mdiChevronRight } from '@mdi/js';
import { useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
      [theme.breakpoints.up('sm')]: { marginTop: 0 },
      [theme.breakpoints.down('xs')]: { marginTop: 0 }
    },
    iconBox: {
      margin: '0 auto'
    },
    gridList: {
      [theme.breakpoints.up('xs')]: { width: 600 },
      [theme.breakpoints.up('sm')]: { width: 960 },
      [theme.breakpoints.up('md')]: { width: 1280 },
      [theme.breakpoints.up('lg')]: { width: 1280 },
      [theme.breakpoints.up('xl')]: { width: 1280 },
      height: 'auto',
      paddingRight: 24,
      paddingLeft: 24,
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

    return 2;
  };

  let tileData: {
    img: string;
    title: string;
    type: string;
  }[] = themeStore.optionalThemeSetting.backgroundImages;

  return (
    <Fragment>
      <Menu />
      <div className={classes.root}>
        <GridList
          spacing={6}
          cellHeight={180}
          className={classes.gridList}
          cols={cols()}
        >
          <GridListTile cols={cols()} style={{ height: 'auto' }}>
            {/* <TextField
              margin='dense'
              variant='outlined'
              inputProps={{ 'aria-label': 'bare' }}
            /> */}
            <Toolbar variant='dense'>
              <Box className={classes.iconBox}>
                <Icon
                  path={mdiChevronLeft}
                  size={1}
                  color='#FFF'
                  style={{
                    cursor: 'pointer'
                  }}
                />
                <Icon
                  path={mdiChevronRight}
                  size={1}
                  color='#FFF'
                  style={{
                    cursor: 'pointer'
                  }}
                />
              </Box>
            </Toolbar>
          </GridListTile>
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
