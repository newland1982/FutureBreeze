import themeStore from '../data/themeStore';

type state = {
  fixedTheme: {};
  imageTheme: string;
};

type action = {
  type: string;
  payload: {
    img: string;
    title: string;
  };
};

const themeReducer = (state: state, action: action) => {
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
