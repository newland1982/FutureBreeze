import React, { useContext } from 'react';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { ThemeContext } from './Theme';

type Props = {

};

type theme = {};

const ThemeContextProviderPart1: React.FC<Props> = props => {
  const { theme } = useContext(ThemeContext);
  console.log('theme', theme);
  return (
    <ThemeProvider theme={createMuiTheme(theme)}>
      {props.children}
    </ThemeProvider>
  );
}

export default ThemeContextProviderPart1;