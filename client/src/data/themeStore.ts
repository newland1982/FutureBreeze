const themeStore = {
  fixedThemeSetting: {
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
  },

  optionalThemeSetting: {
    opacity000000: {
      palette: {
        primary: {
          main: 'rgba(0, 0, 0, 0)'
        },
        text: {
          primary: '#fff'
        },
        background: {
          paper: 'rgba(0, 0, 0, 0)',
          default: '#000'
        }
      }
    },
    opacity000036: {
      palette: {
        primary: {
          main: 'rgba(0, 0, 0, 0.36)'
        },
        text: {
          primary: '#fff'
        },
        background: {
          paper: 'rgba(0, 0, 0, 0)',
          default: '#000'
        }
      }
    },
    backgroundImages: {
      simpleBlack: 'black.jpg',
      simpleBlue: 'blue.jpg',
      simpleGreen: 'green.jpg',
      simpleGrey: 'grey.jpg',
      simpleRed: 'red.jpg'
    }
  }
};

export default themeStore;
