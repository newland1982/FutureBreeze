import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import GridListTile from '@material-ui/core/GridListTile';
import Menu from '../../components/Menu';
import Paper from '@material-ui/core/Paper';
import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { Auth } from 'aws-amplify';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { UserContext } from '../../contexts/UserContext';
import { useHistory } from 'react-router-dom';
import getCanvas from '../../utilities/getCanvas';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: `calc(100vh - 112px)`
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '48%',
      minWidth: 276,
      maxWidth: 360,
      // height: '48%',
      height: '88%',
      minHeight: 204,
      maxHeight: 360,
      padding: theme.spacing(3, 2)
    },
    input: {
      display: 'none'
    },
    gridListTile: {
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
    },
    button: {
      width: '88%',
      minWidth: 240,
      margin: theme.spacing(1)
    }
  })
);

const PostScreen = () => {
  const classes = useStyles();

  const inputRef = useRef<HTMLInputElement>(null);

  const history = useHistory();

  const { user, dispatch } = useContext(UserContext);

  const [objectURLForPC, setObjectURLForPC] = useState('');
  const [objectURLForMobile, setObjectURLForMobile] = useState('');
  const [objectURLForThumbnail, setObjectURLForThumbnail] = useState('');

  const imageWidthForPC = 1980;
  const imageWidthForMobile = 744;
  const imageWidthForThumbnail = 312;

  useEffect(() => {
    inputRef?.current?.click();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const imageElement = new Image();

    imageElement.onload = () => {
      const canvasForPC = getCanvas(imageElement, imageWidthForPC);
      canvasForPC?.toBlob(blob => {
        setObjectURLForPC(window.URL.createObjectURL(blob));
      });

      const canvasForMobile = getCanvas(imageElement, imageWidthForMobile);
      canvasForMobile?.toBlob(blob => {
        setObjectURLForMobile(window.URL.createObjectURL(blob));
      });

      const canvasForThumbnail = getCanvas(
        imageElement,
        imageWidthForThumbnail
      );
      canvasForThumbnail?.toBlob(blob => {
        setObjectURLForThumbnail(window.URL.createObjectURL(blob));
      });
    };

    const selectedFile = event.target.files[0];
    imageElement.src = window.URL.createObjectURL(selectedFile);

    // window.URL.revokeObjectURL(url);
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
      dispatch({
        type: 'SET_USER',
        payload: { ...user, fullUsername: '', password: '', authcode: '' }
      });
      history.goBack();
    } catch {
      history.push('/failure/error');
      return;
    }
  };

  return (
    <Fragment>
      <Menu />
      <Box className={classes.root}>
        <Paper className={classes.paper}>
          <input
            ref={inputRef}
            className={classes.input}
            type='file'
            onChange={handleInputChange}
          />
          <GridListTile className={classes.gridListTile}>
            <img src={objectURLForPC} alt='alt' />
          </GridListTile>
          <Button
            className={classes.button}
            variant='contained'
            size='medium'
            onClick={() => signOut()}
          >
            Choose File
          </Button>
        </Paper>
      </Box>
    </Fragment>
  );
};

export default PostScreen;
