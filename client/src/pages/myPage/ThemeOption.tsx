import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import React from 'react';
import themeStore from '../../data/themeStore';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
      backgroundColor: theme.palette.background.paper,
      [theme.breakpoints.up('sm')]: { marginTop: 72 },
      [theme.breakpoints.down('xs')]: { marginTop: 24 }
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
      paddingBottom: 120
    },
    gridListTile: {
      // margin: 10
    }
  })
);
const ThemeOption = () => {
  const classes = useStyles();
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

  let tileData: { img: string; title: string }[] =
    themeStore.optionalThemeSetting.backgroundImages;

  return (
    <div className={classes.root}>
      <GridList
        spacing={6}
        cellHeight={180}
        className={classes.gridList}
        cols={cols()}
      >
        {tileData.map(tile => (
          <GridListTile
            className={classes.gridListTile}
            key={tile.img}
            cols={1}
          >
            <img src={`../backgroundImage/${tile.img}`} alt={tile.img} />
            <GridListTileBar title={tile.img} />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
};

export default ThemeOption;
