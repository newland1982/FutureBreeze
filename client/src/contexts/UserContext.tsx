import React, { createContext, useReducer } from 'react';
import userReducer from '../reducers/userReducer';

type user = {
  signInCode: string;
};

const initState = {
  signInCode: ''
};

type action = {
  type: string;
  payload: {
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
