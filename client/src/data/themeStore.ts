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
      { img: 'black.jpg', title: 'black', type: 'color' },
      { img: 'blue.jpg', title: 'blue', type: 'color' },
      { img: 'green.jpg', title: 'green', type: 'color' },
      { img: 'grey.jpg', title: 'grey', type: 'color' },
      { img: 'red.jpg', title: 'red', type: 'color' },
      { img: 'forest1.jpg', title: 'forest1', type: 'image' }
    ]
  }
};

export default themeStore;
