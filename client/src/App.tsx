import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import Error from './pages/failure/Error';
import NotFound from './pages/failure/NotFound';
import React from 'react';
import SignUp from './pages/myPage/SignUp';
import SignOut from './pages/myPage/SignOut';
import SignInCodeShow from './pages/myPage/SignInCodeShow';
import ThemeContextProvider from './contexts/ThemeContext';
import ThemeOption from './pages/myPage/ThemeOption';
import UserContextProvider from './contexts/UserContext';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div>
        <ThemeContextProvider>
          <UserContextProvider>
            <CssBaseline />
            <Switch>
              <Route exact path='/mypage/signup' component={SignUp} />
              <Route exact path='/mypage/signout' component={SignOut} />
              <Route
                exact
                path='/mypage/signincodeshow'
                component={SignInCodeShow}
              />
              <Route exact path='/mypage/themeoption' component={ThemeOption} />
              <Route exact path='/failure/error' component={Error} />
              <Route component={NotFound} />
            </Switch>
          </UserContextProvider>
        </ThemeContextProvider>
      </div>
    </BrowserRouter>
  );
};

export default App;
