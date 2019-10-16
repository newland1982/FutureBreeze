import MuiThemeContextProvider from './MuiThemeContext';
import React, { createContext, useEffect, useReducer } from 'react';
import themeReducer from '../reducers/themeReducer';
import themeStore from '../data/themeStore';

type initState = {
  fixedTheme: {};
  colorTheme: {};
  imageTheme: string;
};

const initState = {
  fixedTheme: { ...themeStore.fixedThemeSetting },
  colorTheme: { ...themeStore.optionalThemeSetting.opacity000000 },
  imageTheme: themeStore.optionalThemeSetting.backgroundImages[2].img
};

type action = {
  type: string;
  payload: {
    img: string;
    title: string;
    type: string;
  };
};

export const ThemeContext = createContext<{
  theme: initState;
  dispatch: React.Dispatch<action>;
}>({
  theme: initState,
  dispatch: () => {}
});

type Props = {
  children: JSX.Element[] | JSX.Element;
};

const ThemeContextProvider: React.FC<Props> = props => {
  const [theme, dispatch] = useReducer(themeReducer, initState, () => {
    const localData = localStorage.getItem('theme');
    return localData ? JSON.parse(localData) : initState;
  });
  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  document.body.style.backgroundImage = `url(../backgroundImage/${theme.imageTheme})`;
  document.body.style.backgroundPosition = `center center`;
  document.body.style.backgroundRepeat = `no-repeat`;
  document.body.style.backgroundAttachment = `fixed`;
  document.body.style.backgroundSize = `cover`;
  document.body.style.height = `120vh`;

  return (
    <ThemeContext.Provider value={{ theme, dispatch }}>
      <MuiThemeContextProvider>{props.children}</MuiThemeContextProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
