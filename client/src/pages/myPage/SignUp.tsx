import Amplify, { API, graphqlOperation } from 'aws-amplify';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Menu from '../../components/Menu';
import Paper from '@material-ui/core/Paper';
import React, {
  Fragment,
  useContext,
  useEffect,
  useMemo,
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

  const history = useHistory();

  const location = useLocation();
  useEffect(() => {
    Array.from(document.getElementsByTagName('input')).forEach(inputElement =>
      inputElement.setAttribute('spellcheck', 'false')
    );
  }, [location]);

  const { dispatch } = useContext(UserContext);

  const [userName, setUserName] = useState('');
  const [isValidUserName, setIsValidUserName] = useState(false);
  const [isUniqueUserName, setIsUniqueUserName] = useState(true);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const userNamePrefix = useMemo(() => {
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

  const fullUserName = `${userNamePrefix}${userName}`;
  const password = `${userNamePrefix}${randomNumber}`;
  const signInCode = `${userName}${userNamePrefix}${randomNumber}`;

  const inputUserName = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUserName(e.target.value);
  };

  useEffect(() => {
    const userNameCheck = async () => {
      if (!userName) {
        setIsValidUserName(false);
        return;
      }
      if (!userName.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/)) {
        setIsValidUserName(false);
        return;
      }
      const getUserName = `query GetUserName($userName: String!) {
        getUserName(userName: $userName) {
            userName
        }
       }`;

      setEndpoint(
        process.env
          .REACT_APP_AWS_APPSYNC_aws_appsync_graphqlEndpoint_userUserData
      );

      try {
        const result = await API.graphql(
          graphqlOperation(getUserName, {
            userName
          })
        );
        const userNameAlreadyExists = Boolean(
          result?.data?.getUserName?.userName === userName
        );

        !userNameAlreadyExists
          ? setIsUniqueUserName(true)
          : setIsUniqueUserName(false);
      } catch (error) {
        setIsValidUserName(false);
        return;
      } finally {
      }
      setIsValidUserName(true);
    };
    userNameCheck();
  }, [userNamePrefix, userName]);

  let subscription: { unsubscribe(): void };

  const signUp = async () => {
    setHasBeenClicked(true);

    setEndpoint(
      process.env
        .REACT_APP_AWS_APPSYNC_aws_appsync_graphqlEndpoint_signUpUserInfo
    );
    const createSignUpUserInfo = `mutation CreateSignUpUserInfo($input: CreateSignUpUserInfoInput!) {
      createSignUpUserInfo(input: $input) {
        fullUserName
      }
     }`;

    const createSignUpUserInfoInput = {
      fullUserName,
      password
    };

    try {
      await API.graphql(
        graphqlOperation(createSignUpUserInfo, {
          input: createSignUpUserInfoInput
        })
      );
    } catch (error) {
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
        next: (eventData: eventData) => {
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
          }
          if (eventData.value.data.onSetStatus.status === 'hasSignedUp') {
            subscription?.unsubscribe();
            dispatch({
              type: 'SET_USER',
              payload: { fullUserName, password, signInCode }
            });
            localStorage.setItem(
              'returnLocation',
              JSON.stringify(location.pathname)
            );
            history.push('/mypage/signincodeshow');
          }
        }
      });
    } catch (error) {
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
            className={classes.textField}
            label='Name'
            margin='dense'
            placeholder='e.g.  user_name1,  user_123'
            variant='outlined'
            value={userName}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => inputUserName(e)}
          />
          <Button
            className={classes.button}
            variant='contained'
            size='medium'
            disabled={!isUniqueUserName || !isValidUserName || hasBeenClicked}
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
