import Amplify, { API, Auth, graphqlOperation } from 'aws-amplify';
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
import TextField from '@material-ui/core/TextField';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { UserContext } from '../../contexts/UserContext';
import { useHistory, useLocation } from 'react-router-dom';

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
    identityPoolId:
      process.env.REACT_APP_AWS_COGNITO_HsoUnauthenticatedIdPool_identityPoolId,
    region: process.env.REACT_APP_AWS_COGNITO_region,
    userPoolId: process.env.REACT_APP_AWS_COGNITO_userPoolId,
    userPoolWebClientId: process.env.REACT_APP_AWS_COGNITO_userPoolWebClientId
  },
  aws_appsync_region: process.env.REACT_APP_AWS_APPSYNC_aws_appsync_region,
  aws_appsync_authenticationType:
    process.env.REACT_APP_AWS_APPSYNC_aws_appsync_authenticationType
};

Amplify.configure({ ...amplifyCommonConfig });

const setEndpoint = (endpoint: string | undefined) => {
  Amplify.configure({
    ...amplifyCommonConfig,
    aws_appsync_graphqlEndpoint: endpoint
  });
};

const SignUp = () => {
  const classes = useStyles();

  const textFieldRef = useRef<HTMLInputElement>(null);
  textFieldRef.current?.setAttribute('spellcheck', 'false');

  const history = useHistory();

  const location = useLocation();

  const { user, dispatch } = useContext(UserContext);

  const [username, setUsername] = useState('');
  const [isValidUsername, setIsValidUsername] = useState(false);
  const [isUniqueUsername, setIsUniqueUsername] = useState(true);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUsername(e.target.value);
  };

  useEffect(() => {
    const usernameCheck = async () => {
      if (!username) {
        setIsValidUsername(false);
        return;
      }
      if (!username.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/)) {
        setIsValidUsername(false);
        return;
      }
      const getUsername = `query GetUsername($username: String!) {
        getUsername(username: $username) {
            username
        }
       }`;

      setEndpoint(
        process.env
          .REACT_APP_AWS_APPSYNC_aws_appsync_graphqlEndpoint_userUserData
      );

      try {
        const result = await API.graphql(
          graphqlOperation(getUsername, {
            username
          })
        );
        const usernameAlreadyExists = Boolean(
          result?.data?.getUsername?.username === username
        );

        !usernameAlreadyExists
          ? setIsUniqueUsername(true)
          : setIsUniqueUsername(false);
      } catch {
        setIsValidUsername(false);
        return;
      } finally {
      }
      setIsValidUsername(true);
    };
    usernameCheck();
  }, [usernamePrefix, username]);

  let subscription: { unsubscribe(): void };

  const signUp = async () => {
    setHasBeenClicked(true);

    setEndpoint(
      process.env
        .REACT_APP_AWS_APPSYNC_aws_appsync_graphqlEndpoint_signUpUserInfo
    );
    const createSignUpUserInfo = `mutation CreateSignUpUserInfo($input: CreateSignUpUserInfoInput!) {
      createSignUpUserInfo(input: $input) {
        fullUsername
      }
     }`;

    const createSignUpUserInfoInput = {
      fullUsername,
      password
    };

    try {
      await API.graphql(
        graphqlOperation(createSignUpUserInfo, {
          input: createSignUpUserInfoInput
        })
      );
    } catch {
      localStorage.setItem('returnLocation', JSON.stringify(location.pathname));
      history.push('/failure/error');
      return;
    }

    const setStatus = `subscription OnSetStatus {
      onSetStatus {
        status
      }
     }`;

    type eventData = {
      value: { data: { onSetStatus: { status: string } } };
    };

    try {
      subscription = await API.graphql(graphqlOperation(setStatus))?.subscribe({
        next: async (eventData: eventData) => {
          if (
            !(
              eventData.value.data.onSetStatus.status === 'beingProcessed' ||
              eventData.value.data.onSetStatus.status === 'hasSignedUp'
            )
          ) {
            subscription?.unsubscribe();

            localStorage.setItem(
              'returnLocation',
              JSON.stringify(location.pathname)
            );
            history.push('/failure/error');

            return;
          }
          if (eventData.value.data.onSetStatus.status === 'hasSignedUp') {
            subscription?.unsubscribe();

            await Auth.signOut();
            await Auth.signIn(fullUsername, password);

            dispatch({
              type: 'SET_USER',
              payload: { ...user, fullUsername, password, authcode }
            });

            localStorage.setItem(
              'returnLocation',
              JSON.stringify(location.pathname)
            );
            history.push('/mypage/authcodeshow');
          }
        }
      });
    } catch {
      subscription?.unsubscribe();
      localStorage.setItem('returnLocation', JSON.stringify(location.pathname));
      history.push('/failure/error');
    }
  };

  return (
    <Fragment>
      <Menu />
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
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => inputUsername(e)}
          />
          <Button
            className={classes.button}
            variant='contained'
            size='medium'
            disabled={!isUniqueUsername || !isValidUsername || hasBeenClicked}
            onClick={() => signUp()}
          >
            Sign Up
          </Button>
        </Paper>
      </Box>
    </Fragment>
  );
};

export default SignUp;
