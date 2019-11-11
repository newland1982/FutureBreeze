import Amplify, { API, Auth, graphqlOperation } from 'aws-amplify';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Menu from '../../components/Menu';
import React, { useState, useEffect, Fragment } from 'react';
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

console.log(
  'epiiiiii',
  process.env.REACT_APP_AWS_COGNITO_HsoUnauthenticatedIdPool_identityPoolId
);

const SignUp = () => {
  const classes = useStyles();

  const location = useLocation();
  useEffect(() => {
    Array.from(document.getElementsByTagName('input')).forEach(inputElement =>
      inputElement.setAttribute('spellcheck', 'false')
    );
  }, [location]);

  const [aliasName, setAliasName] = useState('');
  const [isValidAliasName, setIsValidAliasName] = useState(false);
  const [isUniqueAliasName, setIsUniqueAliasName] = useState(true);

  const history = useHistory();

  const inputAliasName = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAliasName(e.target.value);
  };

  useEffect(() => {
    const aliasNameCheck = async () => {
      if (aliasName) {
        await Auth.signIn(aliasName, 'password').catch(err => {
          console.log(err);
          err.code === 'UserNotFoundException'
            ? setIsUniqueAliasName(true)
            : setIsUniqueAliasName(false);
        });
        aliasName.match(/^(?=.{3,22}$)(?=[a-z0-9]+_[a-z0-9]+$)/)
          ? setIsValidAliasName(true)
          : setIsValidAliasName(false);
      }
    };
    aliasNameCheck();
  }, [aliasName]);

  const signUp = async () => {
    const passwordGenerator = () => {
      let uint32HexArray = [];
      for (let i = 0; i < 32; i++) {
        uint32HexArray.push(
          crypto.getRandomValues(new Uint32Array(1))[0].toString(16)
        );
      }
      return uint32HexArray.join('');
    };

    const createUserInfo = `mutation CreateUserInfo($input: CreateUserInfoInput!) {
      createUserInfo(input: $input) {
      id
      aliasName
      }
     }`;

    const createUserInfoInput = {
      aliasName
    };

    try {
      const graphQLResult = await API.graphql(
        graphqlOperation(createUserInfo, { input: createUserInfoInput })
      );
      console.log('result', graphQLResult);
    } catch (err) {
      console.log('errrrr', err);
    }

    const signUpResult = await Auth.signUp({
      username: aliasName,
      password: passwordGenerator()
    }).catch(err => {
      console.log(err);
      setAliasName('');
      localStorage.setItem('returnLocation', JSON.stringify(location.pathname));
      history.push('/failure/error');
    });
    console.log(signUpResult);
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
            value={aliasName}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => inputAliasName(e)}
          />
          <Button
            className={classes.button}
            variant='contained'
            size='medium'
            disabled={!isUniqueAliasName || !isValidAliasName}
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
