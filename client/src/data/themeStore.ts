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
        main: '#222'
      },
      background: {
        default: '#222'
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
