import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import Error from './pages/failure/Error';
import NotFound from './pages/failure/NotFound';
import React from 'react';
import SignuUp from './pages/myPage/SignUp';
import SignInCode from './pages/myPage/SignInCode';
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
              <Route exact path='/mypage/signup' component={SignuUp} />
              <Route exact path='/mypage/signincode' component={SignInCode} />
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
