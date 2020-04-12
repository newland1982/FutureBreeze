import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Menu from '../../components/Menu';
import Paper from '@material-ui/core/Paper';
import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import Typography from '@material-ui/core/Typography';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { UserContext } from '../../contexts/UserContext';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: `calc(100vh - 112px)`,
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '48%',
      minWidth: 276,
      maxWidth: 360,
      height: 'auto',
      minHeight: 260,
    },
    display: {
      wordWrap: 'break-word',
      width: '100%',
      padding: '20px',
    },
    button: {
      width: '24%',
    },
  })
);

const AuthcodeShow = () => {
  const classes = useStyles();

  const paperRef = useRef<HTMLDivElement>(null);

  const history = useHistory();

  const { user } = useContext(UserContext);

  const [fontSize, setFontSize] = useState('body1');
  const [authcodeHasBeenCopied, setAuthcodeHasBeenCopied] = useState(false);

  const typedFontSize = fontSize as 'body1' | 'body2';

  useEffect(() => {
    const mediaQueryList = window.matchMedia('(max-height: 374px)');

    const handleMediaQueryList = (
      mediaQueryList: MediaQueryList | MediaQueryListEvent
    ) => {
      if (mediaQueryList.matches) {
        setFontSize('body2');
      } else {
        setFontSize('body1');
      }
    };

    handleMediaQueryList(mediaQueryList);
    mediaQueryList.addListener(handleMediaQueryList);

    return () => mediaQueryList.removeListener(handleMediaQueryList);
  });

  const copy = () => {
    paperRef.current?.setAttribute(
      'style',
      'background-color: rgba(0, 0, 0, 0.88);'
    );
    const resetPaperRefStyle = () => {
      paperRef.current?.removeAttribute('style');
    };
    setTimeout(resetPaperRefStyle, 60);

    const textareaElement = document.createElement('textarea');
    textareaElement.textContent = user.authcode;
    const bodyElement = document.getElementsByTagName('body')[0];
    bodyElement.appendChild(textareaElement);
    textareaElement.readOnly = true;
    textareaElement.select();
    document.execCommand('copy');
    bodyElement.removeChild(textareaElement);
    setAuthcodeHasBeenCopied(true);
  };

  const back = () => {
    history.push(`${user.baseLocation}`);
    return;
  };

  return (
    <Fragment>
      <Menu />
      <Box className={classes.root}>
        <Paper ref={paperRef} className={classes.paper}>
          <Box className={classes.display}>
            <Typography variant={typedFontSize} gutterBottom>
              {user.authcode}
            </Typography>
          </Box>
          <Box
            mb={2}
            style={{
              display: `${user.authcode ? 'inline' : 'none'}`,
            }}
          >
            <Box
              style={{
                display: `${!authcodeHasBeenCopied ? 'inline' : 'none'}`,
              }}
            >
              <Button
                className={classes.button}
                variant='contained'
                size='small'
                color='primary'
                onClick={() => copy()}
              >
                Copy
              </Button>
            </Box>

            <Box
              style={{
                display: `${authcodeHasBeenCopied ? 'inline' : 'none'}`,
              }}
            >
              <Button
                className={classes.button}
                variant='contained'
                size='small'
                color='primary'
                onClick={() => back()}
              >
                Back
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Fragment>
  );
};

export default AuthcodeShow;
