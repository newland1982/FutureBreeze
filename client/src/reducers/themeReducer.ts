import themeStore from '../data/themeStore';

type state = {
  fixedTheme: {};
  colorTheme: {};
  imageTheme: string;
};

type action = {
  type: string;
  payload: {
    img: string;
    title: string;
    type: string;
  };
};

const themeReducer = (state: state, action: action) => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        colorTheme:
          action.payload.type === 'color'
            ? { ...themeStore.optionalThemeSetting.opacity000000 }
            : { ...themeStore.optionalThemeSetting.opacity000036 },
        imageTheme: action.payload.img
      };
    default:
      return state;
  }
};

export default themeReducer;
