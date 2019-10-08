import MuiThemeContextProvider from './MuiThemeContext';
import React, { createContext, useReducer } from 'react';
import themeReducer from '../reducers/theme';
import themeStore from '../data/themeStore';

export const ThemeContext = createContext<{
  theme: { fixedTheme: {}; colorTheme: {}; imageTheme: string };
  dispatch: React.Dispatch<{}>;
}>({
  theme: {
    fixedTheme: { ...themeStore.fixedThemeSetting },
    colorTheme: { ...themeStore.optionalThemeSetting.opacity000000 },
    imageTheme: themeStore.optionalThemeSetting.backgroundImages[1].img
  },
  dispatch: () => {}
});

type Props = {
  children: JSX.Element[] | JSX.Element;
};

const ThemeContextProvider: React.FC<Props> = props => {
  const [theme, dispatch] = useReducer(themeReducer, {
    fixedTheme: {
      ...themeStore.fixedThemeSetting
    },
    colorTheme: {
      ...themeStore.optionalThemeSetting.opacity000000
    },
    imageTheme: themeStore.optionalThemeSetting.backgroundImages[1].img
  });

  return (
    <ThemeContext.Provider value={{ theme, dispatch }}>
      <MuiThemeContextProvider>{props.children}</MuiThemeContextProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
