import React, { createContext, useEffect, useReducer } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import userReducer from '../reducers/userReducer';
import { useTheme } from '@material-ui/core/styles';

type user = {
  fullUsername: string;
  password: string;
  authcode: string;
  selectedImage: string;
};

let initState = {
  fullUsername: '',
  password: '',
  authcode: '',
  selectedImage: 'ArtTower_0.jpg'
};

type action = {
  type: string;
  payload: {
    fullUsername: string;
    password: string;
    authcode: string;
    selectedImage: string;
  };
};

export const UserContext = createContext<{
  user: user;
  dispatch: React.Dispatch<action>;
}>({
  user: initState,
  dispatch: () => {}
});

type Props = {
  children: JSX.Element[] | JSX.Element;
};

const UserContextProvider: React.FC<Props> = props => {
  const [user, dispatch] = useReducer(userReducer, initState, () => {
    const selectedImage = localStorage.getItem('selectedImage');
    return selectedImage
      ? { ...initState, selectedImage: JSON.parse(selectedImage) }
      : initState;
  });

  const isXsSize = useMediaQuery(useTheme().breakpoints.down('xs'));
  const deviceType = isXsSize ? 'mobile' : 'pc';
  const element = document.getElementById('style');
  if (element) {
    element.textContent = `
    body:before {
      content: '';
      display: block;
      position: fixed;
      z-index: -1;
      transform: translateZ(0);
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background-size: cover;
      background: url(../backgroundImage/${deviceType}/${user.selectedImage}) center no-repeat;
    }`;
  }

  useEffect(() => {
    localStorage.setItem('selectedImage', JSON.stringify(user.selectedImage));
  }, [user]);

  return (
    <UserContext.Provider value={{ user, dispatch }}>
      {props.children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
