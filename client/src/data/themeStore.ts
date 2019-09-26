export const fixedThemeSetting = {
  props: {
    IconButton: {
      size: 'small'
    }
  },
  mixins: {
    toolbar: {
      minHeight: 48
    }
  }
};

export const optionalThemeSetting = {
  black: {
    palette: {
      primary: {
        main: '#333'
      },
      background: {
        default: '#333'
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
        default: '#003300'
      }
    }
  },
  red: {
    palette: {
      primary: {
        main: '#440000'
      },
      background: {
        default: '#330000'
      }
    }
  },
  blue: {
    palette: {
      primary: {
        main: '#000044'
      },
      background: {
        default: '#000033'
      }
    }
  }
};
