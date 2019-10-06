import './App.css';
import BottomBar from './layout/BottomBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import React, { useEffect } from 'react';
import ThemeContextProvider from './contexts/ThemeContext';
import ThemeOption from './pages/myPage/ThemeOption';
import TopBar from './layout/TopBar';
import { BrowserRouter as Router, Route } from 'react-router-dom';

const App: React.FC = () => {
  useEffect(() => {
    document.body.style.backgroundImage = `url(../backgroundImage/forest.jpg)`;
    document.body.style.backgroundPosition = `center center`;
    document.body.style.backgroundRepeat = `no-repeat`;
    document.body.style.backgroundAttachment = `fixed`;
    document.body.style.backgroundSize = `cover`;
  });

  return (
    <Router>
      <div>
        <ThemeContextProvider>
          <CssBaseline />
          <TopBar />
          <Route path='/mypage/themeoption' component={ThemeOption} />
          <BottomBar />
        </ThemeContextProvider>
      </div>
    </Router>
  );
};

export default App;
