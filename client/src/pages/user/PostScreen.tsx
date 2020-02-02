import Amplify from 'aws-amplify';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Menu from '../../components/Menu';
import Paper from '@material-ui/core/Paper';
import React, {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import makeCanvas from '../../utilities/makeCanvas';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { API, Auth, graphqlOperation, Storage } from 'aws-amplify';
import { UserContext } from '../../contexts/UserContext';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Theme,
  createStyles,
  makeStyles,
  useTheme
} from '@material-ui/core/styles';

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
      height: '48%',
      minHeight: 204,
      maxHeight: 360,
      padding: theme.spacing(3, 2)
    },
    input: {
      display: 'none'
    },
    button: {
      width: '88%',
      minWidth: 240,
      margin: theme.spacing(1)
    }
  })
);

const amplifyCommonConfig = {
  Auth: {
    identityPoolId: process.env.REACT_APP_AWS_COGNITO_identityPoolId,
    region: process.env.REACT_APP_AWS_COGNITO_region,
    userPoolId: process.env.REACT_APP_AWS_COGNITO_userPoolId,
    userPoolWebClientId: process.env.REACT_APP_AWS_COGNITO_userPoolWebClientId
  },
  aws_appsync_region: process.env.REACT_APP_AWS_APPSYNC_aws_appsync_region,
  aws_appsync_authenticationType: 'AWS_IAM',
  Storage: {
    AWSS3: {
      bucket: process.env.REACT_APP_AWS_S3_bucket_screens,
      region: process.env.REACT_APP_AWS_APPSYNC_aws_appsync_region
    }
  }
};

const setAmplifyConfig = (endpoint: string | undefined) => {
  Amplify.configure({
    ...amplifyCommonConfig,
    aws_appsync_graphqlEndpoint: endpoint
  });
};

const PostScreen = () => {
  const classes = useStyles();

  const inputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();
  const history = useHistory();

  const { user, dispatch } = useContext(UserContext);

  const [objectURLForPC, setObjectURLForPC] = useState('');
  const [objectURLForMobile, setObjectURLForMobile] = useState('');
  const [objectURLForThumbnail, setObjectURLForThumbnail] = useState('');
  const [fullUsername, setFullUsername] = useState('');

  const appropriateImageWidthForPC = 1980;
  const appropriateImageWidthForMobile = 744;
  const appropriateImageWidthForThumbnail = 312;

  const initialStyleElementTextContent = useMemo(() => {
    const styleElement = document.getElementById('style');
    if (styleElement) {
      return styleElement.textContent;
    }
  }, []);

  const isXsSize = useMediaQuery(useTheme().breakpoints.down('xs'));
  const deviceType = isXsSize ? 'mobile' : 'pc';

  useEffect(() => {
    setAmplifyConfig(undefined);

    const authenticationCheck = async () => {
      const currentAuthenticatedUser = await Auth.currentAuthenticatedUser({
        bypassCache: true
      }).catch(() => {});

      console.log(
        'currentAuthenticatedUserrrr',
        currentAuthenticatedUser.username
      );
      if (!currentAuthenticatedUser) {
        dispatch({
          type: 'SET_USER',
          payload: { ...user, baseLocation: location.pathname }
        });
        history.push('/user/signin');
      }

      setFullUsername(currentAuthenticatedUser.username);
    };

    authenticationCheck();
  });

  useEffect(() => {
    if (!objectURLForPC || !objectURLForMobile) {
      return;
    }
    const styleElement = document.getElementById('style');
    if (styleElement && deviceType === 'pc') {
      styleElement.textContent = `
      body:before {
        content: '';
        display: block;
        position: fixed;
        z-index: -1;
        transform: translateZ(0);
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: url(${objectURLForPC}) no-repeat center/cover;
      }`;
    } else if (styleElement && deviceType === 'mobile') {
      styleElement.textContent = `
      body:before {
        content: '';
        display: block;
        position: fixed;
        z-index: -1;
        transform: translateZ(0);
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: url(${objectURLForMobile}) no-repeat center/cover;
      }`;
    }
    return () => {
      if (styleElement && initialStyleElementTextContent) {
        styleElement.textContent = initialStyleElementTextContent;
        window.URL.revokeObjectURL(objectURLForPC);
        window.URL.revokeObjectURL(objectURLForMobile);
        window.URL.revokeObjectURL(objectURLForThumbnail);
      }
    };
  }, [
    deviceType,
    initialStyleElementTextContent,
    objectURLForMobile,
    objectURLForPC,
    objectURLForThumbnail
  ]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const imageElement = new Image();

    imageElement.onload = () => {
      const canvasForPC = makeCanvas(imageElement, appropriateImageWidthForPC);
      canvasForPC?.toBlob(blob => {
        setObjectURLForPC(window.URL.createObjectURL(blob));
      });

      const canvasForMobile = makeCanvas(
        imageElement,
        appropriateImageWidthForMobile
      );
      canvasForMobile?.toBlob(blob => {
        setObjectURLForMobile(window.URL.createObjectURL(blob));
      });

      const canvasForThumbnail = makeCanvas(
        imageElement,
        appropriateImageWidthForThumbnail
      );
      canvasForThumbnail?.toBlob(blob => {
        setObjectURLForThumbnail(window.URL.createObjectURL(blob));
      });
    };

    const selectedFile = event.target.files[0];
    imageElement.src = window.URL.createObjectURL(selectedFile);
  };

  const cancel = () => {
    history.goBack();
  };

  const ok = async () => {
    let RegisteredUsersCreatedDate;
    const username = fullUsername.slice(96);
    const fileName = String(new Date().getTime());

    setAmplifyConfig(
      process.env
        .REACT_APP_AWS_APPSYNC_aws_appsync_graphqlEndpoint_RegisteredUsers
    );
    const queryGetCreatedDate = `query GetCreatedDate($username: String!) {
      getCreatedDate(username: $username) {
        createdDate
      }
     }`;

    try {
      console.log('fullusernameee', fullUsername);
      const result = await API.graphql(
        graphqlOperation(queryGetCreatedDate, {
          username
        })
      );
      RegisteredUsersCreatedDate = result.data.getCreatedDate.createdDate;
      console.log('createddatee', RegisteredUsersCreatedDate);
    } catch (error) {
      console.log('errrror???', error);
    }

    const fileForPC = new File([objectURLForPC], fileName, {
      type: 'image/jpeg'
    });

    const putFileForPCResult = await Storage.put(
      `${username}${RegisteredUsersCreatedDate}/pc/${fileName}`,
      fileForPC
    ).catch(error => {
      console.log('s333errrroor', error);
    });
    console.log('s3resulttt', putFileForPCResult);
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
          <Button
            className={classes.button}
            variant='contained'
            size='medium'
            onClick={() => inputRef?.current?.click()}
            style={{
              display: `${
                objectURLForPC && objectURLForMobile && objectURLForThumbnail
                  ? 'none'
                  : 'inline'
              }`
            }}
          >
            Choose File
          </Button>
          <Button
            className={classes.button}
            variant='contained'
            size='medium'
            onClick={() => cancel()}
            style={{
              display: `${
                objectURLForPC && objectURLForMobile && objectURLForThumbnail
                  ? 'inline'
                  : 'none'
              }`
            }}
          >
            Cancel
          </Button>
          <Button
            className={classes.button}
            variant='contained'
            size='medium'
            onClick={() => {
              ok();
            }}
            style={{
              display: `${
                objectURLForPC && objectURLForMobile && objectURLForThumbnail
                  ? 'inline'
                  : 'none'
              }`
            }}
          >
            OK
          </Button>
        </Paper>
      </Box>
    </Fragment>
  );
};

export default PostScreen;
