import React, { createContext, useReducer, useEffect } from 'react';
import themeReducer from '../reducers/theme';
import themeStore from '../data/themeStore';
import ThemeContextProviderPart1 from './ThemePart1';

export const ThemeContext = createContext<any>(themeStore.black);

type Props = {

};

const ThemeContextProvider: React.FC<Props> = props => {
  const [theme, dispatch] = useReducer(themeReducer, themeStore.black);

  return (
    <ThemeContext.Provider value={{ theme, dispatch }}>
      <ThemeContextProviderPart1>
        {props.children}
      </ThemeContextProviderPart1>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
