import Amplify from 'aws-amplify';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import LoadingAnimation from '../../components/LoadingAnimation';
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

const setAmplifyConfig = (
  endpoint: string | undefined,
  authenticationType: string | undefined
) => {
  Amplify.configure({
    ...amplifyCommonConfig,
    aws_appsync_graphqlEndpoint: endpoint,
    aws_appsync_authenticationType: authenticationType
  });
};

const PostScreen = () => {
  const classes = useStyles();

  const inputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();
  const history = useHistory();

  const { user, dispatch } = useContext(UserContext);

  const [sampleImageObjectURL, setSampleImageObjectURL] = useState('');
  const [sampleImageIsInProgress, setSampleImageIsInProgress] = useState(false);
  const [blobForPC, setBlobForPC] = useState(new Blob());
  const [blobForMobile, setBlobForMobile] = useState(new Blob());
  const [blobForThumbnail, setBlobForThumbnail] = useState(new Blob());
  const [accountName, setAccountName] = useState('');

  const blobSizeLimit = 8 * 1000 * 1000;

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
    setAmplifyConfig(undefined, 'AWS_IAM');

    const checkAuthentication = async () => {
      const currentAuthenticatedUser = await Auth.currentAuthenticatedUser({
        bypassCache: true
      }).catch(() => {});

      if (!currentAuthenticatedUser) {
        dispatch({
          type: 'SET_USER',
          payload: { ...user, baseLocation: location.pathname }
        });
        history.push('/user/signin');
      } else {
        setAccountName(currentAuthenticatedUser.username);
      }
    };

    checkAuthentication();
  });

  useEffect(() => {
    if (!sampleImageObjectURL) {
      return;
    }
    const styleElement = document.getElementById('style');
    if (styleElement) {
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
        background: url(${sampleImageObjectURL}) no-repeat center/cover;
      }`;
    }
    return () => {
      if (styleElement && initialStyleElementTextContent) {
        styleElement.textContent = initialStyleElementTextContent;
        window.URL.revokeObjectURL(sampleImageObjectURL);
      }
    };
  }, [deviceType, initialStyleElementTextContent, sampleImageObjectURL]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      history.push('/failure/error');
      return;
    }

    const imageElement = new Image();

    setSampleImageIsInProgress(true);

    imageElement.onload = () => {
      const canvasForPC = makeCanvas(imageElement, appropriateImageWidthForPC);
      canvasForPC?.toBlob(blob => {
        if (!blob) {
          return;
        }
        if (deviceType === 'pc') {
          setSampleImageObjectURL(window.URL.createObjectURL(blob));
          setSampleImageIsInProgress(false);
        }
        setBlobForPC(blob);
      });

      const canvasForMobile = makeCanvas(
        imageElement,
        appropriateImageWidthForMobile
      );
      canvasForMobile?.toBlob(blob => {
        if (!blob) {
          return;
        }
        if (deviceType === 'mobile') {
          setSampleImageObjectURL(window.URL.createObjectURL(blob));
          setSampleImageIsInProgress(false);
        }
        setBlobForMobile(blob);
      });

      const canvasForThumbnail = makeCanvas(
        imageElement,
        appropriateImageWidthForThumbnail
      );
      canvasForThumbnail?.toBlob(blob => {
        if (!blob) {
          return;
        }
        setBlobForThumbnail(blob);
      });
    };

    const selectedFile = event.target?.files[0];
    imageElement.src = window.URL.createObjectURL(selectedFile);
  };

  const cancel = () => {
    const styleElement = document.getElementById('style');
    if (styleElement && initialStyleElementTextContent) {
      styleElement.textContent = initialStyleElementTextContent;
      setSampleImageObjectURL('');
    } else {
      window.URL.revokeObjectURL(sampleImageObjectURL);
      history.goBack();
    }
  };

  const ok = async () => {
    if (blobForPC.size > blobSizeLimit) {
      history.push('/failure/error');
      return;
    }

    let RegisteredUsersCreatedDate;
    const displayName = accountName.slice(96);
    const unixTimestamp = String(Date.now());

    setAmplifyConfig(
      process.env
        .REACT_APP_AWS_APPSYNC_aws_appsync_graphqlEndpoint_RegisteredUsers,
      'AMAZON_COGNITO_USER_POOLS'
    );
    const registeredUsersQueryGetCreatedDate = `query GetCreatedDate($input: GetCreatedDateInput!) {
      getCreatedDate(input: $input) {
        createdDate
      }
     }`;
    const registeredUsersQueryGetCreatedDateInput = {
      displayName
    };
    try {
      const result = await API.graphql(
        graphqlOperation(registeredUsersQueryGetCreatedDate, {
          input: registeredUsersQueryGetCreatedDateInput
        })
      );
      RegisteredUsersCreatedDate = result.data.getCreatedDate.createdDate;
    } catch {}

    const putFileForPCResult = await Storage.put(
      `${displayName}_${RegisteredUsersCreatedDate}/pc${unixTimestamp}`,
      blobForPC,
      {
        level: 'protected',
        contentType: 'image/jpeg'
      }
    ).catch(() => {});
    console.log(putFileForPCResult);

    const putFileForMobileResult = await Storage.put(
      `${displayName}_${RegisteredUsersCreatedDate}/mobile${unixTimestamp}`,
      blobForMobile,
      {
        level: 'protected',
        contentType: 'image/jpeg'
      }
    ).catch(() => {});
    console.log(putFileForMobileResult);

    const putFileForThumbnailResult = await Storage.put(
      `${displayName}_${RegisteredUsersCreatedDate}/thumbnail${unixTimestamp}`,
      blobForThumbnail,
      {
        level: 'protected',
        contentType: 'image/jpeg'
      }
    ).catch(() => {});
    console.log(putFileForThumbnailResult);
  };

  return (
    <Fragment>
      <Menu />
      <div
        style={{
          display: `${sampleImageIsInProgress ? 'none' : 'inline'}`
        }}
      >
        <Box className={classes.root}>
          <Paper className={classes.paper}>
            <input
              ref={inputRef}
              className={classes.input}
              type='file'
              accept='image/jpg, image/jpeg, image/png'
              onChange={handleInputChange}
            />
            <Button
              className={classes.button}
              variant='contained'
              size='medium'
              onClick={() => inputRef?.current?.click()}
              style={{
                display: `${sampleImageObjectURL ? 'none' : 'inline'}`
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
                display: `${sampleImageObjectURL ? 'inline' : 'none'}`
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
                display: `${sampleImageObjectURL ? 'inline' : 'none'}`
              }}
            >
              OK
            </Button>
          </Paper>
        </Box>
      </div>
      <LoadingAnimation
        isLoading={sampleImageIsInProgress}
        size={124}
        thickness={4}
      />
    </Fragment>
  );
};

export default PostScreen;
