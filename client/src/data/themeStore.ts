const themeStore = {
  fixedThemeSetting: {
    breakpoints: {
      values: {
        xxs: 0, //1 column
        xs: 598, //2
        sm: 864, //3
        md: 1130, //4
        lg: 1380, //5
        xl: 1630 //6
      }
    },
    mixins: {
      toolbar: {
        minHeight: 56
      }
    },
    props: {
      IconButton: {
        size: 'small'
      }
    },
    typography: {
      button: {
        textTransform: 'none'
      }
    }
  },

  optionalThemeSetting: {
    opacity000000: {
      palette: {
        primary: {
          main: 'rgba(0, 0, 0, 0)'
        },
        secondary: {
          main: 'rgba(0, 0, 0, 0.24)'
        },
        text: {
          primary: '#fff',
          secondary: '#fff'
        },
        background: {
          paper: 'rgba(115, 115, 115, 0.36)',
          default: '#000'
        },
        action: {
          disabled: 'rgba(255, 255, 255, 0.36)',
          disabledBackground: 'rgba(255, 255, 255, 0.12)'
        }
      }
    },
    opacity000036: {
      palette: {
        primary: {
          main: 'rgba(0, 0, 0, 0.36)'
        },
        secondary: {
          main: 'rgba(105, 105, 105, 0.42)'
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
          disabledBackground: 'rgba(255, 255, 255, 0.12)'
        }
      }
    },
    backgroundImages: [
      { img: 'black.jpg', title: 'black', type: 'color' },
      { img: 'blue.jpg', title: 'blue', type: 'color' },
      { img: 'green.jpg', title: 'green', type: 'color' },
      { img: 'grey.jpg', title: 'grey', type: 'color' },
      { img: 'red.jpg', title: 'red', type: 'color' },
      { img: 'red.jpg', title: 'red1', type: 'color' },
      { img: 'red.jpg', title: 'red2', type: 'color' },
      { img: 'red.jpg', title: 'red3', type: 'color' },
      { img: 'red.jpg', title: 'red4', type: 'color' },
      { img: 'red.jpg', title: 'red5', type: 'color' },
      { img: 'red.jpg', title: 'red6', type: 'color' },
      { img: 'red.jpg', title: 'red7', type: 'color' },
      { img: 'forest1.jpg', title: 'forest1', type: 'image' }
    ]
  }
};

export default themeStore;
