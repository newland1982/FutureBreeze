import './stylingData/App.css';
import AuthcodeShow from './pages/user/AuthcodeShow';
import ChangeAuthcode from './pages/user/ChangeAuthcode';
import CssBaseline from '@material-ui/core/CssBaseline';
import Error from './pages/failure/Error';
import PostScreen from './pages/screen/PostScreen';
import Screens from './pages/screen/Screens';
import NotFound from './pages/failure/NotFound';
import Quit from './pages/user/Quit';
import React from 'react';
import SignIn from './pages/user/SignIn';
import SignOut from './pages/user/SignOut';
import SignUp from './pages/user/SignUp';
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
            <Route exact path='/user/authcodeshow' component={AuthcodeShow} />
            <Route
              exact
              path='/user/changeauthcode'
              component={ChangeAuthcode}
            />
            <Route exact path='/user/edit' component={SignUp} />
            <Route exact path='/screen/screens' component={Screens} />
            <Route exact path='/user/quit' component={Quit} />
            <Route exact path='/user/signin' component={SignIn} />
            <Route exact path='/user/signout' component={SignOut} />
            <Route exact path='/user/signup' component={SignUp} />

            <Route exact path='/screen/postscreen' component={PostScreen} />

            <Route exact path='/failure/error' component={Error} />
            <Route component={NotFound} />
          </Switch>
        </UserContextProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
