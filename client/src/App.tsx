import './App.css';
import BottomBar from './layout/BottomBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import React from 'react';
import SignuUp from './pages/myPage/SignUp';
import ThemeContextProvider from './contexts/ThemeContext';
import ThemeOption from './pages/myPage/ThemeOption';
import TopBar from './layout/TopBar';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div>
        <ThemeContextProvider>
          <CssBaseline />
          <TopBar />
          <Switch>
            <Route exact path='/mypage/signup' component={SignuUp} />
            <Route exact path='/mypage/themeoption' component={ThemeOption} />
            {/* <Route exact component={ThemeOption} /> */}
          </Switch>
          <BottomBar />
        </ThemeContextProvider>
      </div>
    </BrowserRouter>
  );
};

export default App;
