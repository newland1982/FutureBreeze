import './App.css';
import BottomBar from './layout/BottomBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import React from 'react';
import ThemeContextProvider from './contexts/ThemeContext';
import ThemeOption from './pages/myPage/ThemeOption';
import TopBar from './layout/TopBar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <ThemeContextProvider>
          <CssBaseline />
          <TopBar />
          <Switch>
            <Route exact path='/mypage/themeoption' component={ThemeOption} />
            <Route exact component={ThemeOption} />
          </Switch>
          <BottomBar />
        </ThemeContextProvider>
      </div>
    </Router>
  );
};

export default App;
