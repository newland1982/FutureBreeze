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
      { img: 'black.jpg', title: 'black' },
      { img: 'blue.jpg', title: 'blue' },
      { img: 'green.jpg', title: 'green' },
      { img: 'grey.jpg', title: 'grey' },
      { img: 'red.jpg', title: 'red' },
      { img: 'forest1.jpg', title: 'forest1' }
    ]
  }
};

export default themeStore;
