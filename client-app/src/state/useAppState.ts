import { useContext } from "react";
import { AppContext } from "./AppContext";

export const useAppState = () => {
  return useContext(AppContext);
};
