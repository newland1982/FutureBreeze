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

  const [username, setUsername] = useState('');
  const [usernameIsValid, setUsernameIsValid] = useState(false);
  const [usernameIsUnique, setUsernameIsUnique] = useState(true);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);
  const [intervalTimerId, setIntervalTimerId] = useState(0);
  const [signUpUsersStatus, setSignUpUsersStatus] = useState('');
  const [hasSignedUp, setHasSignedUp] = useState(false);
  const [
    registeredUsersMutationSetCognitoIdentityIdIsCompleted,
    setRegisteredUsersMutationSetCognitoIdentityIdIsCompleted
  ] = useState(false);

  const usernamePrefix = useMemo(() => {
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

  const fullUsername = `${usernamePrefix}${username}`;
  const password = `${usernamePrefix}${randomNumber}`;
  const authcode = `${username}${usernamePrefix}${randomNumber}`;

  const inputUsername = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUsername(event.target.value);
  };

  useEffect(() => {
    const usernameCheck = async () => {
      if (!username) {
        setUsernameIsValid(false);
        return;
      }
      if (!username.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/)) {
        setUsernameIsValid(false);
        return;
      }

      setAmplifyConfig(
        process.env
          .REACT_APP_AWS_APPSYNC_aws_appsync_graphqlEndpoint_RegisteredUsers,
        'AWS_IAM'
      );
      const registeredUsersQueryGetUsername = `query GetUsername($input: GetUsernameInput!) {
        getUsername(input: $input) {
            username
        }
       }`;
      const getUsernameInput = {
        username
      };

      try {
        const result = await API.graphql(
          graphqlOperation(registeredUsersQueryGetUsername, {
            input: getUsernameInput
          })
        );
        const usernameAlreadyExists = Boolean(
          result?.data?.getUsername?.username === username
        );

        !usernameAlreadyExists
          ? setUsernameIsUnique(true)
          : setUsernameIsUnique(false);
      } catch {
        setUsernameIsValid(false);
        return;
      } finally {
      }
      setUsernameIsValid(true);
    };
    usernameCheck();
  }, [usernamePrefix, username]);

  useEffect(() => {
    if (
      !(
        signUpUsersStatus === '' ||
        signUpUsersStatus === 'init' ||
        signUpUsersStatus === 'beingProcessed' ||
        signUpUsersStatus === 'hasSignedUp'
      )
    ) {
      clearInterval(intervalTimerId);
      history.push('/failure/error');
      return;
    }
    if (signUpUsersStatus === 'hasSignedUp') {
      clearInterval(intervalTimerId);
      setHasSignedUp(true);
    }
  }, [history, intervalTimerId, signUpUsersStatus]);

  useEffect(() => {
    if (!hasSignedUp) {
      return;
    }

    const registeredUsersMutationSetCognitoIdentityIdExecution = async () => {
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
        setRegisteredUsersMutationSetCognitoIdentityIdIsCompleted(true);
      } catch {
        history.push('/failure/error');
        return;
      }
    };

    const signOutAndSignIn = async () => {
      await Auth.signOut();
      await Auth.signIn(fullUsername, password);
      registeredUsersMutationSetCognitoIdentityIdExecution();
    };

    signOutAndSignIn();
  }, [fullUsername, hasSignedUp, history, password]);

  useEffect(() => {
    if (!registeredUsersMutationSetCognitoIdentityIdIsCompleted) {
      return;
    }
    dispatch({
      type: 'SET_USER',
      payload: { ...user, fullUsername, password, authcode }
    });

    history.push('/user/authcodeshow');
  }, [
    authcode,
    dispatch,
    fullUsername,
    history,
    registeredUsersMutationSetCognitoIdentityIdIsCompleted,
    password,
    user
  ]);

  const signUp = async () => {
    setHasBeenClicked(true);
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
      fullUsername,
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

    setIntervalTimerId(window.setInterval(watchSignUpUsersStatus, 2400));
  };

  return (
    <Fragment>
      <Menu />
      <div
        style={{
          display: `${hasBeenClicked ? 'none' : 'inline'}`
        }}
      >
        <Box className={classes.root}>
          <Paper className={classes.paper}>
            <TextField
              ref={textFieldRef}
              className={classes.textField}
              label='Username'
              margin='dense'
              placeholder='e.g.  user_name,  name_123'
              variant='outlined'
              value={username}
              onChange={(
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => inputUsername(event)}
            />
            <Button
              className={classes.button}
              variant='contained'
              size='medium'
              disabled={!usernameIsUnique || !usernameIsValid || hasBeenClicked}
              onClick={() => signUp()}
            >
              Sign Up
            </Button>
          </Paper>
        </Box>
      </div>
      <LoadingAnimation
        hasBeenClicked={hasBeenClicked}
        size={124}
        thickness={4}
      />
    </Fragment>
  );
};

export default SignUp;
