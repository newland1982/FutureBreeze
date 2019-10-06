import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
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
      marginTop: '18%'
    },
    gridList: {
      width: 500,
      height: 'auto',
      paddingBottom: 120
    },
    gridListTile: {
      // margin: 10
    }
  })
);

export default function ImageGridList() {
  const classes = useStyles();

  let tileData: string[] = themeStore.optionalThemeSetting.backgroundImages;

  return (
    <div className={classes.root}>
      <GridList
        spacing={18}
        cellHeight={160}
        className={classes.gridList}
        cols={3}
      >
        {tileData.map(tile => (
          <GridListTile className={classes.gridListTile} key={tile} cols={1}>
            <img src={`../backgroundImage/${tile}`} alt={tile} />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}
