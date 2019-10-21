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
    backgroundImages: [
      { img: 'black.jpg', title: 'black' },
      { img: 'TheDigitalArtist1.jpg', title: 'TheDigitalArtist1' },
      {
        img: 'Pexels1.jpg',
        title: 'Pexels1'
      },
      { img: 'Pixabay1.jpg', title: 'Pixabay1' },
      { img: 'Pixabay2.jpg', title: 'Pixabay2' },
      { img: 'forest1.jpg', title: 'forest1' }
    ]
  }
};

export default themeStore;
