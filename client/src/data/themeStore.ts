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
        // main: 'rgba(105, 105, 105, 0.42)'
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
        disabledBackground: 'rgba(0, 0, 0, 0.24)'
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
      { img: 'qimono_0.jpg', by: 'qimono' },
      { img: '8385_0.jpg', by: '8385' },
      { img: 'ArtTower_0.jpg', by: 'ArtTower' },
      { img: 'Pixabay_0.jpg', by: 'Pixabay' },
      { img: 'Pixabay_1.jpg', by: 'Pixabay' },
      { img: 'garageband_0.jpg', by: 'garageband' }
    ]
  }
};

export default themeStore;
