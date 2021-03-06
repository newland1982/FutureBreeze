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
  useState,
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
  useTheme,
} from '@material-ui/core/styles';

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
      height: '48%',
      minHeight: 204,
      maxHeight: 360,
      padding: theme.spacing(3, 2),
    },
    input: {
      display: 'none',
    },
    button: {
      width: '88%',
      minWidth: 240,
      margin: theme.spacing(1),
    },
  })
);

const amplifyCommonConfig = {
  Auth: {
    identityPoolId: process.env.REACT_APP_AWS_COGNITO_identityPoolId,
    region: process.env.REACT_APP_AWS_COGNITO_region,
    userPoolId: process.env.REACT_APP_AWS_COGNITO_userPoolId,
    userPoolWebClientId: process.env.REACT_APP_AWS_COGNITO_userPoolWebClientId,
  },
  aws_appsync_region: process.env.REACT_APP_AWS_APPSYNC_aws_appsync_region,
  aws_appsync_authenticationType: 'AWS_IAM',
  Storage: {
    AWSS3: {
      bucket: process.env.REACT_APP_AWS_S3_bucket_screens,
      region: process.env.REACT_APP_AWS_S3_bucket_region,
    },
  },
};

const setAmplifyConfig = (
  endpoint: string | undefined,
  authenticationType: string | undefined
) => {
  Amplify.configure({
    ...amplifyCommonConfig,
    aws_appsync_graphqlEndpoint: endpoint,
    aws_appsync_authenticationType: authenticationType,
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

  const appropriateImageWidthForPC = 1980 * 0.48;
  const appropriateImageWidthForMobile = 744 * 0.48;
  const appropriateImageWidthForThumbnail = 312 * 0.48;

  const initialStyleElementTextContent = useMemo(() => {
    const styleElement = document.getElementById('style');
    if (styleElement) {
      return styleElement.textContent;
    }
  }, []);

  const isXsSize = useMediaQuery(useTheme().breakpoints.down('xs'));
  const deviceType = isXsSize ? 'mobile' : 'pc';

  const postScreenCountLimit = 36;

  const intervalTime = 2400;
  let setIntervalCountLimit = 6;
  const [intervalTimerId, setIntervalTimerId] = useState(0);
  const [setIntervalCount, setSetIntervalCount] = useState(0);
  const [
    graphqlOperation_Screens_Mutation_ConfirmScreen_IsCompleted,
    set_GraphqlOperation_Screens_Mutation_ConfirmScreen_IsCompleted,
  ] = useState(true);
  const refSetIntervalCount = useRef(setIntervalCount);
  const ref_GraphqlOperation_Screens_Mutation_ConfirmScreen_IsCompleted = useRef(
    graphqlOperation_Screens_Mutation_ConfirmScreen_IsCompleted
  );
  const [confirmScreenIsCompleted, setConfirmScreenIsCompleted] = useState(
    false
  );

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setAmplifyConfig(undefined, 'AWS_IAM');
        const currentAuthenticatedUser = await Auth.currentAuthenticatedUser({
          bypassCache: true,
        });
        setAccountName(currentAuthenticatedUser.username);
      } catch (error) {
        dispatch({
          type: 'SET_USER',
          payload: { ...user, baseLocation: location.pathname },
        });
        history.push('/user/signin');
      }
    };
    checkAuthentication();
  }, [dispatch, history, location.pathname, user]);

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
      const canvasForMobile = makeCanvas(
        imageElement,
        appropriateImageWidthForMobile
      );
      const canvasForThumbnail = makeCanvas(
        imageElement,
        appropriateImageWidthForThumbnail
      );

      const executeSetBlobForPC = () => {
        return new Promise((resolve, reject) => {
          canvasForPC?.toBlob((blob) => {
            if (!blob || blob.size > blobSizeLimit) {
              reject('error');
              return;
            }
            if (deviceType === 'pc') {
              setSampleImageObjectURL(window.URL.createObjectURL(blob));
              setSampleImageIsInProgress(false);
            }
            setBlobForPC(blob);
            resolve('success');
          });
        });
      };

      const executeSetBlobForMobile = () => {
        return new Promise((resolve, reject) => {
          canvasForMobile?.toBlob((blob) => {
            if (!blob) {
              reject('error');
              return;
            }

            if (deviceType === 'mobile') {
              setSampleImageObjectURL(window.URL.createObjectURL(blob));
              setSampleImageIsInProgress(false);
            }
            setBlobForMobile(blob);
            resolve('success');
          });
        });
      };

      const executeSetBlobForThumbnail = () => {
        return new Promise((resolve, reject) => {
          canvasForThumbnail?.toBlob((blob) => {
            if (!blob) {
              reject('error');
              return;
            }
            setBlobForThumbnail(blob);
            resolve('success');
          });
        });
      };

      (async () => {
        try {
          await executeSetBlobForPC();
        } catch (error) {
          history.push('/failure/error');
          return;
        }

        try {
          await executeSetBlobForMobile();
        } catch (error) {
          window.URL.revokeObjectURL(sampleImageObjectURL);
          history.push('/failure/error');
          return;
        }

        try {
          await executeSetBlobForThumbnail();
        } catch (error) {
          window.URL.revokeObjectURL(sampleImageObjectURL);
          history.push('/failure/error');
          return;
        }
      })();
    };

    const selectedFile = event.target?.files[0];
    imageElement.src = window.URL.createObjectURL(selectedFile);
  };

  const cancel = () => {
    const styleElement = document.getElementById('style');
    if (styleElement && initialStyleElementTextContent) {
      styleElement.textContent = initialStyleElementTextContent;
      setSampleImageObjectURL('');
      if (inputRef?.current?.value) {
        inputRef.current.value = '';
      }
    } else {
      history.goBack();
    }
  };

  const post = async () => {
    if (blobForPC.size > blobSizeLimit) {
      history.push('/failure/error');
      return;
    }

    let RegisteredUsersCreatedDate: number;
    const displayName = accountName.slice(96);
    const unixTimestamp = String(Date.now());

    setAmplifyConfig(
      process.env
        .REACT_APP_AWS_APPSYNC_aws_appsync_graphqlEndpoint_RegisteredUsers,
      'AWS_IAM'
    );

    const registeredUsers_Mutation_PrepareSetPostScreenCount = `mutation PrepareSetPostScreenCount($input: PrepareSetPostScreenCountInput!) {
      prepareSetPostScreenCount(input: $input) {
        postScreenCount
      }
    }`;
    const registeredUsers_Mutation_PrepareSetPostScreenCount_Input = {
      displayName,
    };
    try {
      await API.graphql(
        graphqlOperation(registeredUsers_Mutation_PrepareSetPostScreenCount, {
          input: registeredUsers_Mutation_PrepareSetPostScreenCount_Input,
        })
      );
    } catch (error) {
      if (
        error.errors[0].errorType !== 'DynamoDB:ConditionalCheckFailedException'
      ) {
        history.push('/failure/error');
        return;
      }
    }

    const registeredUsers_Query_GetPostScreenCount = `query GetPostScreenCount($input: GetPostScreenCountInput!) {
      getPostScreenCount(input: $input) {
        postScreenCount
      }
    }`;
    const registeredUsers_Query_GetPostScreenCount_Input = {
      displayName,
    };
    try {
      const result = await API.graphql(
        graphqlOperation(registeredUsers_Query_GetPostScreenCount, {
          input: registeredUsers_Query_GetPostScreenCount_Input,
        })
      );
      if (
        !(
          result.data.getPostScreenCount.postScreenCount + 3 <=
          postScreenCountLimit
        )
      ) {
        history.push('/failure/error');
        return;
      }
    } catch (error) {
      history.push('/failure/error');
      return;
    }

    setAmplifyConfig(
      process.env
        .REACT_APP_AWS_APPSYNC_aws_appsync_graphqlEndpoint_RegisteredUsers,
      'AWS_IAM'
    );
    const registeredUsers_Query_GetCreatedDate = `query GetCreatedDate($input: GetCreatedDateInput!) {
      getCreatedDate(input: $input) {
        createdDate
      }
    }`;
    const registeredUsers_Query_GetCreatedDate_Input = {
      displayName,
    };
    try {
      const result = await API.graphql(
        graphqlOperation(registeredUsers_Query_GetCreatedDate, {
          input: registeredUsers_Query_GetCreatedDate_Input,
        })
      );
      RegisteredUsersCreatedDate = result.data.getCreatedDate.createdDate;
    } catch (error) {
      history.push('/failure/error');
      return;
    }

    try {
      const putFileForThumbnailResult = await Storage.put(
        `${displayName}_${String(
          RegisteredUsersCreatedDate
        )}/${unixTimestamp}thumbnail`,
        blobForThumbnail,
        {
          level: 'protected',
          contentType: 'image/jpeg',
        }
      );
      const putFileForMobileResult = await Storage.put(
        `${displayName}_${String(
          RegisteredUsersCreatedDate
        )}/${unixTimestamp}mobile`,
        blobForMobile,
        {
          level: 'protected',
          contentType: 'image/jpeg',
        }
      );
      const putFileForPCResult = await Storage.put(
        `${displayName}_${String(
          RegisteredUsersCreatedDate
        )}/${unixTimestamp}pc`,
        blobForPC,
        {
          level: 'protected',
          contentType: 'image/jpeg',
        }
      );

      console.log(putFileForThumbnailResult);
      console.log(putFileForMobileResult);
      console.log(putFileForPCResult);
      // begin 1
      const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
      if (!currentAuthenticatedUser) {
        history.push('/failure/error');
        return;
      }
      const cognitoIdentityId =
        currentAuthenticatedUser.storage[
          `aws.cognito.identity-id.${process.env.REACT_APP_AWS_COGNITO_identityPoolId}`
        ];

      setAmplifyConfig(
        process.env.REACT_APP_AWS_APPSYNC_aws_appsync_graphqlEndpoint_Screens,
        'AMAZON_COGNITO_USER_POOLS'
      );
      const screens_Mutation_ConfirmScreen = `mutation ConfirmScreen($input: ConfirmScreenInput!) {
        confirmScreen(input: $input) {
          confirmScreenIsCompleted
        }
      }`;
      const screens_Mutation_ConfirmScreen_Input = {
        screenName: `protected/${cognitoIdentityId}/${displayName}_${String(
          RegisteredUsersCreatedDate
        )}/${unixTimestamp}`,
      };
      const screens_Mutation_ConfirmScreen_Result_Watcher = async () => {
        if (refSetIntervalCount.current + 1 > setIntervalCountLimit) {
          setSetIntervalCount(refSetIntervalCount.current + 1);
          return;
        }
        try {
          if (
            !ref_GraphqlOperation_Screens_Mutation_ConfirmScreen_IsCompleted.current
          ) {
            return;
          }
          set_GraphqlOperation_Screens_Mutation_ConfirmScreen_IsCompleted(
            false
          );
          const result = await API.graphql(
            graphqlOperation(screens_Mutation_ConfirmScreen, {
              input: screens_Mutation_ConfirmScreen_Input,
            })
          );
          setConfirmScreenIsCompleted(
            result.data.confirmScreen.confirmScreenIsCompleted
          );
          setSetIntervalCount(refSetIntervalCount.current + 1);
          set_GraphqlOperation_Screens_Mutation_ConfirmScreen_IsCompleted(true);
        } catch (error) {
          return;
        }
      };
      setIntervalTimerId(
        window.setInterval(
          screens_Mutation_ConfirmScreen_Result_Watcher,
          intervalTime
        )
      );
      // end 1
    } catch (error) {
      history.push('/failure/error');
      return;
    }
  };

  // begin 2
  useEffect(() => {
    refSetIntervalCount.current = setIntervalCount;
    ref_GraphqlOperation_Screens_Mutation_ConfirmScreen_IsCompleted.current = graphqlOperation_Screens_Mutation_ConfirmScreen_IsCompleted;

    if (
      refSetIntervalCount.current > setIntervalCountLimit &&
      ref_GraphqlOperation_Screens_Mutation_ConfirmScreen_IsCompleted.current
    ) {
      clearInterval(intervalTimerId);
      setConfirmScreenIsCompleted(false);
      history.push('/failure/error');
      return;
    }
  }, [
    confirmScreenIsCompleted,
    history,
    intervalTimerId,
    setIntervalCountLimit,
    setIntervalCount,
    graphqlOperation_Screens_Mutation_ConfirmScreen_IsCompleted,
  ]);

  useEffect(() => {
    if (confirmScreenIsCompleted === true) {
      clearInterval(intervalTimerId);
      history.push('/screen/screens');
      return;
    }
  }, [confirmScreenIsCompleted, history, intervalTimerId]);
  // end 2

  return (
    <Fragment>
      <Menu />
      <div
        style={{
          display: `${sampleImageIsInProgress ? 'none' : 'inline'}`,
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
              color='primary'
              onClick={() => inputRef?.current?.click()}
              style={{
                display: `${sampleImageObjectURL ? 'none' : 'inline'}`,
              }}
            >
              Choose File
            </Button>
            <Button
              className={classes.button}
              variant='contained'
              size='medium'
              color='primary'
              onClick={() => cancel()}
              style={{
                display: `${sampleImageObjectURL ? 'inline' : 'none'}`,
              }}
            >
              Cancel
            </Button>
            <Button
              className={classes.button}
              variant='contained'
              size='medium'
              color='primary'
              onClick={() => {
                post();
              }}
              style={{
                display: `${sampleImageObjectURL ? 'inline' : 'none'}`,
              }}
            >
              Post
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
