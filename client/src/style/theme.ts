import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  mixins: {
    toolbar: {
      minHeight: 56
    }
  },
  palette: {
    primary: {
      main: 'rgba(0, 0, 0, 0.36)'
    },
    secondary: {
      main: 'rgba(0, 0, 0, 0.6)'
    },
    text: {
      primary: '#fff',
      secondary: '#fff'
    },
    background: {
      paper: 'rgba(0, 0, 0, 0.6)',
      default: '#000'
    },
    action: {
      disabled: 'rgba(255, 255, 255, 0.36)',
      disabledBackground: 'rgba(255, 255, 255, 0.36)'
    }
  },
  typography: {
    button: {
      textTransform: 'none'
    }
  }
});

export default theme;
