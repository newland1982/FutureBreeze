import React, { createContext, useReducer } from 'react';
import userReducer from '../reducers/userReducer';

type user = {
  fullUserName: string;
  password: string;
  signInCode: string;
};

const initState = {
  fullUserName: '',
  password: '',
  signInCode: ''
};

type action = {
  type: string;
  payload: {
    fullUserName: string;
    password: string;
    signInCode: string;
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
  const [user, dispatch] = useReducer(userReducer, initState);

  return (
    <UserContext.Provider value={{ user, dispatch }}>
      {props.children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
