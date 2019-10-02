import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';

type Props = {
  children: JSX.Element[] | JSX.Element;
};

const MuiThemeContextProvider: React.FC<Props> = props => {
  const { theme } = useContext(ThemeContext);
  console.log('theme', props);
  return (
    <ThemeProvider theme={createMuiTheme(theme)}>
      {props.children}
    </ThemeProvider>
  );
};

export default MuiThemeContextProvider;
