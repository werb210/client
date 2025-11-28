import { createContext, useContext, useState, ReactNode } from "react";

const ApplicationContext = createContext<
  | {
      application: unknown;
      setApplication: (value: unknown) => void;
    }
  | null
>(null);

export default function ApplicationProvider({ children }: { children: ReactNode }) {
  const [application, setApplication] = useState<unknown>(null);

  return (
    <ApplicationContext.Provider value={{ application, setApplication }}>
      {children}
    </ApplicationContext.Provider>
  );
}

export const useApplication = () => useContext(ApplicationContext);
