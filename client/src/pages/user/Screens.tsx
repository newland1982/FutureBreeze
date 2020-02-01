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
import { UserContext } from '../../contexts/UserContext';
import { mdiClose } from '@mdi/js';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    searchBox: {
      width: 244,
      margin: '0 auto'
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(276px, 1fr))',
      gridTemplateRows: '1fr',
      gridRowGap: 16,
      gridColumnGap: 16,
      paddingRight: 0,
      paddingLeft: 0,
      paddingTop: 0,
      paddingBottom: 48,
      marginTop: 48
    },
    gridListTile: {
      cursor: 'pointer',
      width: '100%',
      paddingTop: '70%',
      position: 'relative',
      '& .MuiGridListTile-tile': {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        objectFit: 'cover'
      }
    }
  })
);
const Screens = () => {
  const classes = useStyles();

  const textFieldRef = useRef<HTMLInputElement>(null);
  textFieldRef.current?.setAttribute('spellcheck', 'false');

  const { user, dispatch } = useContext(UserContext);

  const [searchWord, setSearchWord] = useState('');

  let tileData: {
    imageId: string;
    img: string;
    by: string;
  }[] = [
    { imageId: 'qimono_0.jpg', img: 'qimono_0.jpg', by: 'qimono' },
    { imageId: '8385_0.jpg', img: '8385_0.jpg', by: '8385' },
    { imageId: 'ArtTower_0.jpg', img: 'ArtTower_0.jpg', by: 'ArtTower' },
    { imageId: 'Pixabay_0.jpg', img: 'Pixabay_0.jpg', by: 'Pixabay' },
    { imageId: 'Pixabay_1.jpg', img: 'Pixabay_1.jpg', by: 'Pixabay' },
    { imageId: 'garageband_0.jpg', img: 'garageband_0.jpg', by: 'garageband' }
  ];

  type tile = {
    imageId: string;
    img: string;
    by: string;
  };

  const setScreen = (tile: tile) => {
    dispatch({
      type: 'SET_USER',
      payload: { ...user, selectedImage: tile.imageId }
    });
  };

  return (
    <Fragment>
      <Menu path={'/user/postscreen'} />
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
              key={tile.imageId}
              onClick={() => setScreen(tile)}
              style={{
                display: `${
                  tile.imageId === user.selectedImage ? 'none' : 'inline'
                }`
              }}
            >
              <img src={`../thumbnails/${tile.imageId}`} alt={tile.imageId} />
              <GridListTileBar title={tile.imageId} />
            </GridListTile>
          ))}
        </div>
      </Container>
    </Fragment>
  );
};

export default Screens;
