import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Icon from '@mdi/react';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Menu from '../../components/Menu';
import React, { Fragment, useContext, useRef, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { ThemeContext } from '../../contexts/ThemeContext';
import { mdiClose } from '@mdi/js';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    searchBox: {
      width: 244,
      margin: '0 auto'
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
const Images = () => {
  const classes = useStyles();

  const textFieldRef = useRef<HTMLInputElement>(null);
  textFieldRef.current?.setAttribute('spellcheck', 'false');

  const { theme, dispatch } = useContext(ThemeContext);
  const [searchWord, setSearchWord] = useState('');

  let tileData: {
    img: string;
    by: string;
  }[] = [
    { img: 'qimono_0.jpg', by: 'qimono' },
    { img: '8385_0.jpg', by: '8385' },
    { img: 'ArtTower_0.jpg', by: 'ArtTower' },
    { img: 'Pixabay_0.jpg', by: 'Pixabay' },
    { img: 'Pixabay_1.jpg', by: 'Pixabay' },
    { img: 'garageband_0.jpg', by: 'garageband' }
  ];

  return (
    <Fragment>
      <Menu />
      <Box mt={3} mb={2}>
        <Toolbar variant='dense'>
          <Box className={classes.searchBox}>
            <TextField
              ref={textFieldRef}
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

export default Images;
