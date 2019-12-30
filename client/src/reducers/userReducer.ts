type user = {
  fullUserName: string;
  password: string;
  signInCode: string;
};

type action = {
  type: string;
  payload: {
    fullUserName: string;
    password: string;
    signInCode: string;
  };
};

const userReducer = (state: user, action: action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        fullUserName: action.payload.fullUserName,
        password: action.payload.password,
        signInCode: action.payload.signInCode
      };
    default:
      return state;
  }
};

export default userReducer;
