import React, { createContext, useReducer, useEffect } from 'react';
import { themeReducer } from '../reducers/theme';
import { createMuiTheme } from '@material-ui/core/styles';
import themeStore from '../data/themeStore';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';

export const ThemeContext = createContext({});

const initialTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#444444'
    },
    background: {
      default: '#000000'
    }
  }
});

const ThemeContextProvider = props => {
  const [theme, dispatch] = useReducer(themeReducer, themeStore.black, () => {
    const localData = localStorage.getItem('theme');
    return localData ? JSON.parse(localData) : [];
  });
  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, dispatch }}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
