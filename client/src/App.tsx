import './App.css';
import BottomBar from './layout/BottomBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import React from 'react';
import ThemeContextProvider from './contexts/ThemeContext';
import ThemeOption from './pages/myPage/ThemeOption';
import TopBar from './layout/TopBar';
import { BrowserRouter as Router, Route } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <ThemeContextProvider>
          <CssBaseline />
          <TopBar />
          <Route exact path='/mypage/themeoption' component={ThemeOption} />
          <BottomBar />
        </ThemeContextProvider>
      </div>
    </Router>
  );
};

export default App;
