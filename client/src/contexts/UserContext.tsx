import React, { createContext, useEffect, useReducer } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import userReducer from '../reducers/userReducer';
import { useTheme } from '@material-ui/core/styles';

type user = {
  fullUserName: string;
  password: string;
  authCode: string;
  selectedImage: string;
};

let initState = {
  fullUserName: '',
  password: '',
  authCode: '',
  selectedImage: 'ArtTower_0.jpg'
};

type action = {
  type: string;
  payload: {
    fullUserName: string;
    password: string;
    authCode: string;
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

  document.body.style.backgroundImage = `url(../backgroundImage/${deviceType}/${user.selectedImage})`;
  document.body.style.backgroundPosition = `center center`;
  document.body.style.backgroundRepeat = `no-repeat`;
  document.body.style.backgroundAttachment = `fixed`;
  document.body.style.backgroundSize = `cover`;
  document.body.style.height = `100vh`;

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
