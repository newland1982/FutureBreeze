import './App.css';
import BottomBar from './components/layouts/BottomBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import MyPage from './components/myPage/MyPage';
import React from 'react';
import ThemeContextProvider from './contexts/ThemeContext';
import TopBar from './components/layouts/TopBar';
import { BrowserRouter as Router, Route } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <Router>
      <div className='App'>
        <ThemeContextProvider>
          <CssBaseline />
          <TopBar />
          <Route path='/mypage' component={MyPage} />
          <BottomBar />
        </ThemeContextProvider>
      </div>
    </Router>
  );
};

export default App;
