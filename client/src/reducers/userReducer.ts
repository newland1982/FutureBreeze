type user = {
  fullUserName: string;
  password: string;
  authCode: string;
};

type action = {
  type: string;
  payload: {
    fullUserName: string;
    password: string;
    authCode: string;
  };
};

const userReducer = (state: user, action: action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        fullUserName: action.payload.fullUserName,
        password: action.payload.password,
        authCode: action.payload.authCode
      };
    default:
      return state;
  }
};

export default userReducer;
