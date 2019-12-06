import Observable from 'zen-observable';
import Amplify, { API, Auth, graphqlOperation } from 'aws-amplify';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Menu from '../../components/Menu';
import Paper from '@material-ui/core/Paper';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { useHistory, useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: `calc(100vh - 112px)`
    },
    button: {
      width: '88%',
      minWidth: 240,
      margin: theme.spacing(1)
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
    }
  })
);

Amplify.configure({
  Auth: {
    identityPoolId:
      process.env.REACT_APP_AWS_COGNITO_HsoUnauthenticatedIdPool_identityPoolId,
    region: process.env.REACT_APP_AWS_COGNITO_region,
    userPoolId: process.env.REACT_APP_AWS_COGNITO_userPoolId,
    userPoolWebClientId: process.env.REACT_APP_AWS_COGNITO_userPoolWebClientId
  },
  aws_appsync_graphqlEndpoint:
    process.env.REACT_APP_AWS_APPSYNC_aws_appsync_graphqlEndpoint,
  aws_appsync_region: process.env.REACT_APP_AWS_APPSYNC_aws_appsync_region,
  aws_appsync_authenticationType:
    process.env.REACT_APP_AWS_APPSYNC_aws_appsync_authenticationType
});

const SignUp = () => {
  const classes = useStyles();

  const location = useLocation();
  useEffect(() => {
    Array.from(document.getElementsByTagName('input')).forEach(inputElement =>
      inputElement.setAttribute('spellcheck', 'false')
    );
  }, [location]);

  const [userName, setUserName] = useState('');
  const [isValidUserName, setIsValidUserName] = useState(false);
  const [isUniqueUserName, setIsUniqueUserName] = useState(true);

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

  const history = useHistory();

  const inputUserName = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUserName(e.target.value);
  };

  useEffect(() => {
    const userNameCheck = async () => {
      const fullUserName = `${userNamePrefix}${userName}`;
      if (userName) {
        await Auth.signIn(fullUserName, 'password').catch(error => {
          console.log(error);
          error.code === 'UserNotFoundException'
            ? setIsUniqueUserName(true)
            : setIsUniqueUserName(false);
        });
        userName.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/)
          ? setIsValidUserName(true)
          : setIsValidUserName(false);
      }
    };
    userNameCheck();
  }, [userNamePrefix, userName]);

  const signUp = async () => {
    const createSignUpUserInfo = `mutation CreateSignUpUserInfo($input: CreateSignUpUserInfoInput!) {
      createSignUpUserInfo(input: $input) {
        regularUserName
      }
     }`;

    const createSignUpUserInfoInput = {
      regularUserName: `${userNamePrefix}${userName}`,
      password: `${userNamePrefix}${randomNumber}`
    };

    try {
      const result = await API.graphql(
        graphqlOperation(createSignUpUserInfo, {
          input: createSignUpUserInfoInput
        })
      );
      console.log('result1', result);
    } catch (error) {
      console.log('errorrrr', error);
    }

    const setStatus = `subscription OnSetStatus {
      onSetStatus {
        status
      }
     }`;

    const observable: Observable<object> = (await API.graphql(
      graphqlOperation(setStatus)
    )) as Observable<object>;

    type eventData = {
      value: { data: { onSetStatus: { status: string } } };
    };

    observable.subscribe({
      next: (eventData: eventData) => {
        console.log('wqwqwq', eventData.value.data.onSetStatus.status);
      },
      complete: () => {},
      error: () => {}
    });

    // const signUpResult = await Auth.signUp({
    //   username: userName,
    //   password: `${userNamePrefix}${randomNumber}`
    // }).catch(error => {
    //   console.log(error);
    //   setUserName('');
    //   localStorage.setItem('returnLocation', JSON.stringify(location.pathname));
    //   history.push('/failure/erroror');
    // });
    // console.log(signUpResult);
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
            disabled={!isUniqueUserName || !isValidUserName}
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
