import MuiThemeContextProvider from './MuiThemeContext';
import React, { createContext, useReducer } from 'react';
import themeReducer from '../reducers/theme';
import { fixedThemeSetting, optionalThemeSetting } from '../data/themeStore';

export const ThemeContext = createContext<{
  theme: {};
  dispatch: React.Dispatch<{}>;
}>({ theme: {}, dispatch: () => {} });

type Props = {
  children: JSX.Element[] | JSX.Element;
};

const ThemeContextProvider: React.FC<Props> = props => {
  const [theme, dispatch] = useReducer(themeReducer, {
    ...fixedThemeSetting,
    ...optionalThemeSetting.black
  });

  return (
    <ThemeContext.Provider value={{ theme, dispatch }}>
      <MuiThemeContextProvider>{props.children}</MuiThemeContextProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
