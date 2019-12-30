type user = {
  signInCode: string;
};

type action = {
  type: string;
  payload: {
    signInCode: string;
  };
};

const userReducer = (state: user, action: action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        signInCode: action.payload.signInCode
      };
    default:
      return state;
  }
};

export default userReducer;
