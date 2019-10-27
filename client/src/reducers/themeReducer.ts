import themeStore from '../data/themeStore';

type theme = {
  fixedTheme: {};
  imageTheme: string;
};

type action = {
  type: string;
  payload: {
    img: string;
    by: string;
  };
};

const themeReducer = (state: theme, action: action) => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        fixedTheme: { ...themeStore.fixedThemeSetting },
        imageTheme: action.payload.img
      };
    default:
      return state;
  }
};

export default themeReducer;
