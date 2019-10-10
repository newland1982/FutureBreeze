import MuiThemeContextProvider from './MuiThemeContext';
import React, { createContext, useReducer } from 'react';
import themeReducer from '../reducers/theme';
import themeStore from '../data/themeStore';

type initState = {
  fixedTheme: {};
  colorTheme: {};
  imageTheme: string;
};

const initState = {
  fixedTheme: { ...themeStore.fixedThemeSetting },
  colorTheme: { ...themeStore.optionalThemeSetting.opacity000000 },
  imageTheme: themeStore.optionalThemeSetting.backgroundImages[0].img
};
console.log(initState);

export const ThemeContext = createContext<{
  theme: initState;
  dispatch: React.Dispatch<{}>;
}>({
  theme: initState,
  dispatch: () => {}
});

type Props = {
  children: JSX.Element[] | JSX.Element;
};

const ThemeContextProvider: React.FC<Props> = props => {
  const [theme, dispatch] = useReducer(themeReducer, initState);

  return (
    <ThemeContext.Provider value={{ theme, dispatch }}>
      <MuiThemeContextProvider>{props.children}</MuiThemeContextProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
