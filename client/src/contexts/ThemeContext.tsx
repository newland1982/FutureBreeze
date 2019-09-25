import React, { createContext, useReducer, useEffect } from 'react';
import themeReducer from '../reducers/theme';
import { fixedTheme, optionalTheme } from '../data/themeStore';
import MuiThemeContextProvider from './MuiThemeContext';

export const ThemeContext = createContext({});

type Props = {};

const ThemeContextProvider: React.FC<Props> = props => {
  const [theme, dispatch] = useReducer(themeReducer, {
    fixedTheme,
    ...optionalTheme.black
  });

  return (
    <ThemeContext.Provider value={{ theme, dispatch }}>
      <MuiThemeContextProvider>{props.children}</MuiThemeContextProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
