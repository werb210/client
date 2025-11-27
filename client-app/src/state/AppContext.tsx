import React, { createContext, useReducer, ReactNode, Dispatch } from "react";
import { appReducer, AppState, AppAction } from "./appReducer";

const initialState: AppState = {
  user: null,
  application: null,
};

export const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => {}
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
