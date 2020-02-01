type user = {
  fullUsername: string;
  password: string;
  authcode: string;
  baseLocation: string;
  selectedImage: string;
};

type action = {
  type: string;
  payload: {
    fullUsername: string;
    password: string;
    authcode: string;
    baseLocation: string;
    selectedImage: string;
  };
};

const userReducer = (state: user, action: action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        fullUsername: action.payload.fullUsername,
        password: action.payload.password,
        authcode: action.payload.authcode,
        baseLocation: action.payload.baseLocation,
        selectedImage: action.payload.selectedImage
      };
    default:
      return state;
  }
};

export default userReducer;
