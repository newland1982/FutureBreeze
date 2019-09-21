import React from 'react';
import logo from './logo.svg';
import './App.css';
import TopBar from './components/TopBar';

const App: React.FC = () => {
  return (
    <div className='App'>
      <TopBar />
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className='App-link'
          href='https://reactjs.org'
          target='_blank'
          rel='noopener noreferrer'
        >
          Learn Reactaaaffsdfadazz
        </a>
      </header>
    </div>
  );
};

export default App;
