export type AppState = {
  user: any;
  application: any;
};

export type AppAction = {
  type: string;
  payload?: any;
};

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    default:
      return state;
  }
};
