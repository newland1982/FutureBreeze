export const fixedThemeSetting = {
  mixins: {
    toolbar: {
      minHeight: 48
    }
  },
  props: {
    IconButton: {
      size: 'small'
    }
  }
};

export const optionalThemeSetting = {
  black: {
    palette: {
      primary: {
        main: '#000'
      },
      text: {
        primary: '#fff'
      },
      background: {
        paper: '#222',
        default: '#000'
      }
    }
  },
  grey: {
    palette: {
      primary: {
        main: '#444'
      },
      background: {
        default: '#444'
      }
    }
  },
  green: {
    palette: {
      primary: {
        main: '#004400'
      },
      background: {
        default: '#004400'
      }
    }
  },
  red: {
    palette: {
      primary: {
        main: '#440000'
      },
      background: {
        default: '#440000'
      }
    }
  },
  blue: {
    palette: {
      primary: {
        main: '#000044'
      },
      background: {
        default: '#000044'
      }
    }
  }
};
