import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Icon from '@mdi/react';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Menu from '../../components/Menu';
import React, { Fragment, useContext, useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import themeStore from '../../data/themeStore';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { ThemeContext } from '../../contexts/ThemeContext';
import { mdiChevronLeft } from '@mdi/js';
import { mdiChevronRight } from '@mdi/js';
import { mdiClose } from '@mdi/js';
import { useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    searchBox: {
      width: 244,
      margin: '0 auto'
    },
    iconBox: {
      margin: '0 auto'
    },
    chevronLeftIcon: {
      position: 'fixed',
      top: 'calc((100vh - 48px) / 2)',
      [theme.breakpoints.down('lg')]: { left: 4.8 },
      [theme.breakpoints.up('xl')]: { left: 'calc((100vw - 1630px ) / 2)' }
    },
    chevronRightIcon: {
      position: 'fixed',
      top: 'calc((100vh - 48px) / 2)',
      [theme.breakpoints.down('lg')]: { right: 4.8 },
      [theme.breakpoints.up('xl')]: { right: 'calc((100vw - 1630px ) / 2)' }
    },
    gridListTile: {
      cursor: 'pointer'
    },
    gridContainer: {
      display: 'grid',
      gridAutoRows: 180,
      gridTemplateColumns: 'repeat(auto-fit, 244px)',
      justifyContent: 'center',
      gridRowGap: 6,
      gridColumnGap: 6,
      paddingRight: 36,
      paddingLeft: 36,
      paddingTop: 0,
      paddingBottom: 48,
      marginTop: 30
    }
  })
);
const ThemeOption = () => {
  const classes = useStyles();

  const location = useLocation();
  useEffect(() => {
    Array.from(document.getElementsByTagName('input')).forEach(inputElement =>
      inputElement.setAttribute('spellcheck', 'false')
    );
  }, [location]);

  const { theme, dispatch } = useContext(ThemeContext);
  const [searchWord, setSearchWord] = useState('');

  let tileData: {
    img: string;
    title: string;
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
              value={searchWord}
              InputProps={{
                endAdornment: (
                  <InputAdornment
                    position='end'
                    onClick={() => setSearchWord('')}
                  >
                    <Box
                      style={{
                        display: `${searchWord === '' ? 'none' : 'inline'}`
                      }}
                    >
                      <IconButton
                        size='small'
                        style={{
                          marginLeft: '0 !important'
                        }}
                      >
                        <Icon
                          path={mdiClose}
                          size={0.6}
                          color='#FFF'
                          style={{
                            marginLeft: '0 !important',
                            cursor: 'pointer'
                          }}
                        />
                      </IconButton>
                    </Box>
                  </InputAdornment>
                )
              }}
              onChange={e => setSearchWord(e.target.value)}
            />
          </Box>
        </Toolbar>
      </Box>
      <Container maxWidth='xl'>
        <div className={classes.gridContainer}>
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
              <img src={`../thumbnails/${tile.img}`} alt={tile.img} />
              <GridListTileBar title={tile.img} />
            </GridListTile>
          ))}
        </div>
      </Container>
    </Fragment>
  );
};

export default ThemeOption;
