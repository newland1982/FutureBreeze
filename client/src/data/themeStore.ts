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
    backgroundImages: [
      'black.jpg',
      'blue.jpg',
      'green.jpg',
      'grey.jpg',
      'red.jpg',
      'forest.jpg'
    ]
  }
};

export default themeStore;
