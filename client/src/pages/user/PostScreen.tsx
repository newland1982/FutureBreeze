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

  const [objectUrl, setObjectUrl] = useState('');

  useEffect(() => {
    inputRef?.current?.click();
  }, []);

  const resizeSelectedFile = (selectedFile: File) => {
    if (!selectedFile) {
      return;
    }

    const roughCanvas = document.createElement('canvas');

    const imageElement = new Image();

    imageElement.onload = () => {
      roughCanvas.width = imageElement.naturalWidth;
      roughCanvas.height = imageElement.naturalHeight;
      console.log('naturalwidthhh', imageElement.naturalWidth);
      console.log('naturalheighthhh', imageElement.naturalHeight);

      const roughCanvasContext = roughCanvas.getContext('2d');
      roughCanvasContext?.drawImage(imageElement, 0, 0);

      for (let i = 0; i < 3; i++) {
        const canvasPattern = roughCanvasContext?.createPattern(
          roughCanvas,
          'no-repeat'
        );

        if (!roughCanvasContext || !canvasPattern) {
          return;
        }

        roughCanvas.width /= 2;
        roughCanvas.height /= 2;

        roughCanvasContext?.scale(0.5, 0.5);

        roughCanvasContext.fillStyle = canvasPattern;
        roughCanvasContext?.fillRect(
          0,
          0,
          roughCanvas.width * 2,
          roughCanvas.height * 2
        );
      }

      const formalCanvas = document.createElement('canvas');

      formalCanvas.width = roughCanvas.width;
      formalCanvas.height = roughCanvas.height;

      const formalCanvasContext = formalCanvas.getContext('2d');

      formalCanvasContext?.drawImage(roughCanvas, 0, 0);

      formalCanvas.toBlob(blob => {
        setObjectUrl(window.URL.createObjectURL(blob));
      });
    };

    const url = window.URL.createObjectURL(selectedFile);
    imageElement.src = url;

    // window.URL.revokeObjectURL(url);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      console.log('nothingggg');
      return;
    }
    console.log('eventtt', event.target.files);
    const selectedFile = event.target.files[0];
    console.log('selectedfileee', selectedFile);
    resizeSelectedFile(selectedFile);
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
            <img src={objectUrl} alt='alt' />
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
