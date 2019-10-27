type userInfo = {
  userName: string;
  password: string;
};

type action = {
  type: string;
  payload: {
    userName: string;
    password: string;
  };
};

const userInfoReducer = (state: userInfo, action: action) => {
  switch (action.type) {
    case 'SET_USERINFO':
      return {
        userName: action.payload.userName,
        password: action.payload.password
      };
    default:
      return state;
  }
};

export default userInfoReducer;
