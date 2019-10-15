import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import React from 'react';
import SignuUp from './pages/myPage/SignUp';
import ThemeContextProvider from './contexts/ThemeContext';
import ThemeOption from './pages/myPage/ThemeOption';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div>
        <ThemeContextProvider>
          <CssBaseline />
          <Switch>
            <Route exact path='/mypage/signup' component={SignuUp} />
            <Route exact path='/mypage/themeoption' component={ThemeOption} />
            {/* <Route exact component={ThemeOption} /> */}
          </Switch>
        </ThemeContextProvider>
      </div>
    </BrowserRouter>
  );
};

export default App;
