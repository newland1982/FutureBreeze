import React, { useContext } from 'react';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { ThemeContext } from './ThemeContext';

type Props = object;

const MuiThemeContextProvider: React.FC<Props> = props => {
  const { theme }: { theme?: object } = useContext(ThemeContext);
  console.log('theme', theme);
  return (
    <ThemeProvider theme={createMuiTheme(theme)}>
      {props.children}
    </ThemeProvider>
  );
};

export default MuiThemeContextProvider;
