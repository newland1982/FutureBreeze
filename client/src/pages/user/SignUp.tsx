import Amplify, { API, Auth, graphqlOperation } from 'aws-amplify';
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
import TextField from '@material-ui/core/TextField';
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
      height: '48%',
      minHeight: 204,
      maxHeight: 360,
      padding: theme.spacing(3, 2)
    },
    textField: {
      width: '88%',
      minWidth: 240
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
  aws_appsync_region: process.env.REACT_APP_AWS_APPSYNC_aws_appsync_region
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

const SignUp = () => {
  const classes = useStyles();

  const textFieldRef = useRef<HTMLInputElement>(null);
  textFieldRef.current?.setAttribute('spellcheck', 'false');

  const history = useHistory();

  const { user, dispatch } = useContext(UserContext);

  const [displayName, setDisplayName] = useState('');
  const [displayNameIsValid, setDisplayNameIsValid] = useState(false);
  const [displayNameIsUnique, setDisplayNameIsUnique] = useState(true);
  const [signUpButtonHasBeenClicked, setSignUpButtonHasBeenClicked] = useState(
    false
  );
  const [intervalTimerId, setIntervalTimerId] = useState(0);
  const intervalTime = 2400;
  const [signUpUsersStatus, setSignUpUsersStatus] = useState('');
  const [userHasSignedUp, setUserHasSignedUp] = useState(false);
  const [userHasSignedIn, setUserHasSignedIn] = useState(false);
  const [
    executeRegisteredUsersMutationSetCognitoIdentityIdIsCompleted,
    setRegisteredUsersMutationSetCognitoIdentityIdExecutionIsCompleted
  ] = useState(false);

  const displayNamePrefix = useMemo(() => {
    let uint32HexArray = [];
    for (let i = 0; i < 12; i++) {
      uint32HexArray.push(
        `00000000${crypto
          .getRandomValues(new Uint32Array(1))[0]
          .toString(16)}`.slice(-8)
      );
    }
    return uint32HexArray.join('');
  }, []);

  const randomNumber = useMemo(() => {
    let uint32HexArray = [];
    for (let i = 0; i < 20; i++) {
      uint32HexArray.push(
        `00000000${crypto
          .getRandomValues(new Uint32Array(1))[0]
          .toString(16)}`.slice(-8)
      );
    }
    return uint32HexArray.join('');
  }, []);

  const accountName = `${displayNamePrefix}${displayName}`;
  const password = `${displayNamePrefix}${randomNumber}`;
  const authcode = `${displayName}${displayNamePrefix}${randomNumber}`;

  const executeSetDisplayName = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setDisplayName(event.target.value);
  };

  useEffect(() => {
    const checkDisplayName = async () => {
      if (!displayName) {
        setDisplayNameIsValid(false);
        return;
      }
      if (!displayName.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/)) {
        setDisplayNameIsValid(false);
        return;
      }

      setAmplifyConfig(
        process.env
          .REACT_APP_AWS_APPSYNC_aws_appsync_graphqlEndpoint_RegisteredUsers,
        'AWS_IAM'
      );
      const registeredUsersQueryGetDisplayName = `query GetDisplayName($input: GetDisplayNameInput!) {
        getDisplayName(input: $input) {
            displayName
        }
       }`;
      const getDisplayNameInput = {
        displayName
      };

      try {
        const result = await API.graphql(
          graphqlOperation(registeredUsersQueryGetDisplayName, {
            input: getDisplayNameInput
          })
        );
        const displayNameAlreadyExists = Boolean(
          result?.data?.getDisplayName?.displayName === displayName
        );

        !displayNameAlreadyExists
          ? setDisplayNameIsUnique(true)
          : setDisplayNameIsUnique(false);
      } catch {
        setDisplayNameIsValid(false);
        return;
      } finally {
      }
      setDisplayNameIsValid(true);
    };
    checkDisplayName();
  }, [displayNamePrefix, displayName]);

  const signUp = async () => {
    setSignUpButtonHasBeenClicked(true);
    let id: string;

    setAmplifyConfig(
      process.env.REACT_APP_AWS_APPSYNC_aws_appsync_graphqlEndpoint_SignUpUsers,
      'AWS_IAM'
    );
    const signUpUsersMutationCreateSignUpUser = `mutation CreateSignUpUser($input: CreateSignUpUserInput!) {
      createSignUpUser(input: $input) {
        id
      }
     }`;
    const createSignUpUserInput = {
      accountName,
      password
    };
    try {
      const result = await API.graphql(
        graphqlOperation(signUpUsersMutationCreateSignUpUser, {
          input: createSignUpUserInput
        })
      );
      id = result?.data?.createSignUpUser?.id;
    } catch {
      history.push('/failure/error');
      return;
    }

    const signUpUsersQueryGetStatus = `query GetStatus($input: GetStatusInput!) {
      getStatus(input: $input) {
        status
      }
     }`;
    const getStatusInput = {
      id
    };
    const watchSignUpUsersStatus = async () => {
      try {
        const result = await API.graphql(
          graphqlOperation(signUpUsersQueryGetStatus, {
            input: getStatusInput
          })
        );
        setSignUpUsersStatus(`${result.data.getStatus.status}`);
      } catch {}
    };

    setIntervalTimerId(
      window.setInterval(watchSignUpUsersStatus, intervalTime)
    );
  };

  useEffect(() => {
    if (
      !(
        signUpUsersStatus === '' ||
        signUpUsersStatus === 'init' ||
        signUpUsersStatus === 'processing' ||
        signUpUsersStatus === 'completed'
      )
    ) {
      clearInterval(intervalTimerId);
      history.push('/failure/error');
      return;
    }
    if (signUpUsersStatus === 'completed') {
      clearInterval(intervalTimerId);
      setUserHasSignedUp(true);
    }
  }, [history, intervalTimerId, signUpUsersStatus]);

  useEffect(() => {
    if (!userHasSignedUp) {
      return;
    }

    const signOutAndSignIn = async () => {
      await Auth.signOut();

      const result = await Auth.signIn(accountName, password);

      if (result.username === accountName) {
        setUserHasSignedIn(true);
      }
      return;
    };

    signOutAndSignIn();
  }, [accountName, password, userHasSignedUp]);

  useEffect(() => {
    if (!userHasSignedIn) {
      return;
    }

    const executeRegisteredUsersMutationSetCognitoIdentityId = async () => {
      const currentAuthenticatedUser = await Auth.currentAuthenticatedUser({
        bypassCache: false
      }).catch(() => {});

      if (!currentAuthenticatedUser) {
        history.push('/failure/error');
        return;
      }
      setAmplifyConfig(
        process.env
          .REACT_APP_AWS_APPSYNC_aws_appsync_graphqlEndpoint_RegisteredUsers,
        'AMAZON_COGNITO_USER_POOLS'
      );
      const registeredUsersMutationSetCognitoIdentityId = `mutation SetCognitoIdentityId($input: SetCognitoIdentityIdInput!) {
        setCognitoIdentityId(input: $input) {
          cognitoIdentityId
        }
       }`;
      const setCognitoIdentityIdInput = {
        cognitoIdentityId:
          currentAuthenticatedUser.storage[
            `aws.cognito.identity-id.${process.env.REACT_APP_AWS_COGNITO_identityPoolId}`
          ]
      };
      try {
        await API.graphql(
          graphqlOperation(registeredUsersMutationSetCognitoIdentityId, {
            input: setCognitoIdentityIdInput
          })
        );
        setRegisteredUsersMutationSetCognitoIdentityIdExecutionIsCompleted(
          true
        );
      } catch {
        history.push('/failure/error');
        return;
      }
    };

    executeRegisteredUsersMutationSetCognitoIdentityId();
  }, [accountName, userHasSignedIn, history, password]);

  useEffect(() => {
    if (!executeRegisteredUsersMutationSetCognitoIdentityIdIsCompleted) {
      return;
    }
    dispatch({
      type: 'SET_USER',
      payload: { ...user, accountName, password, authcode }
    });

    history.push('/user/showauthcode');
  }, [
    authcode,
    dispatch,
    accountName,
    history,
    executeRegisteredUsersMutationSetCognitoIdentityIdIsCompleted,
    password,
    user
  ]);

  return (
    <Fragment>
      <Menu />
      <div
        style={{
          display: `${signUpButtonHasBeenClicked ? 'none' : 'inline'}`
        }}
      >
        <Box className={classes.root}>
          <Paper className={classes.paper}>
            <TextField
              ref={textFieldRef}
              className={classes.textField}
              label='Name'
              margin='dense'
              placeholder='e.g.  abc123_xyz,  abc_123'
              variant='outlined'
              value={displayName}
              onChange={(
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => executeSetDisplayName(event)}
            />
            <Button
              className={classes.button}
              variant='contained'
              size='medium'
              disabled={
                !displayNameIsUnique ||
                !displayNameIsValid ||
                signUpButtonHasBeenClicked
              }
              onClick={() => signUp()}
            >
              Sign Up
            </Button>
          </Paper>
        </Box>
      </div>
      <LoadingAnimation
        hasBeenClicked={signUpButtonHasBeenClicked}
        size={124}
        thickness={4}
      />
    </Fragment>
  );
};

export default SignUp;
