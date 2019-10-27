import React, { createContext, useReducer } from 'react';
import userInfoReducer from '../reducers/userInfoReducer';

type userInfo = {
  userName: string;
  password: string;
};

const initState = {
  userName: '',
  password: ''
};

type action = {
  type: string;
  payload: {
    userName: string;
    password: string;
  };
};

export const UserInfoContext = createContext<{
  userInfo: userInfo;
  dispatch: React.Dispatch<action>;
}>({
  userInfo: initState,
  dispatch: () => {}
});

type Props = {
  children: JSX.Element[] | JSX.Element;
};

const UserInfoContextProvider: React.FC<Props> = props => {
  const [userInfo, dispatch] = useReducer(userInfoReducer, initState);

  return (
    <UserInfoContext.Provider value={{ userInfo, dispatch }}>
      {props.children}
    </UserInfoContext.Provider>
  );
};

export default UserInfoContextProvider;
