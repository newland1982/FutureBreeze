import MuiThemeContextProvider from './MuiThemeContext';
import React, { createContext, useEffect, useReducer } from 'react';
import themeReducer from '../reducers/themeReducer';
import themeStore from '../data/themeStore';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';

type initState = {
  fixedTheme: {};
  imageTheme: string;
};

const initState = {
  fixedTheme: { ...themeStore.fixedThemeSetting },
  imageTheme: themeStore.optionalThemeSetting.backgroundImages[2].img
};

type action = {
  type: string;
  payload: {
    img: string;
    by: string;
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

  const isXsSize = useMediaQuery(useTheme().breakpoints.down('xs'));
  const deviceType = isXsSize ? 'mobile' : 'pc';

  document.body.style.backgroundImage = `url(../backgroundImage/${deviceType}/${theme.imageTheme})`;
  document.body.style.backgroundPosition = `center center`;
  document.body.style.backgroundRepeat = `no-repeat`;
  document.body.style.backgroundAttachment = `fixed`;
  document.body.style.backgroundSize = `cover`;
  document.body.style.height = `100vh`;

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, dispatch }}>
      <MuiThemeContextProvider>{props.children}</MuiThemeContextProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
