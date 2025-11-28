import { createContext, useContext, useState, ReactNode } from "react";

const AuthContext = createContext<
  | {
      auth: unknown;
      setAuth: (value: unknown) => void;
    }
  | null
>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<unknown>(null);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
