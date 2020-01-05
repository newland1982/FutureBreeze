import './stylingData/App.css';
import AuthCodeShow from './pages/myPage/AuthCodeShow';
import ChangeAuthCode from './pages/myPage/ChangeAuthCode';
import CssBaseline from '@material-ui/core/CssBaseline';
import Error from './pages/failure/Error';
import Images from './pages/myPage/Images';
import NotFound from './pages/failure/NotFound';
import Quit from './pages/myPage/Quit';
import React from 'react';
import SignIn from './pages/myPage/SignIn';
import SignOut from './pages/myPage/SignOut';
import SignUp from './pages/myPage/SignUp';
import UserContextProvider from './contexts/UserContext';
import theme from './stylingData/theme';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <UserContextProvider>
          <CssBaseline />
          <Switch>
            <Route exact path='/mypage/signin' component={SignIn} />
            <Route exact path='/mypage/signup' component={SignUp} />
            <Route exact path='/mypage/signout' component={SignOut} />
            <Route exact path='/mypage/authcodeshow' component={AuthCodeShow} />
            <Route exact path='/mypage/edit' component={SignUp} />
            <Route exact path='/mypage/images' component={Images} />
            <Route
              exact
              path='/mypage/changeauthcode'
              component={ChangeAuthCode}
            />
            <Route exact path='/mypage/quit' component={Quit} />
            <Route exact path='/failure/error' component={Error} />
            <Route component={NotFound} />
          </Switch>
        </UserContextProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
