import { createContext, useContext, useMemo, useState, ReactNode } from "react";

// Summary: App-wide Context Provider for global state (e.g., loading flag). Reusable and avoids props drilling.

export type AppState = {
  loading: boolean;
};

export type AppContextValue = {
  state: AppState;
  setLoading: (value: boolean) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);

  const value = useMemo<AppContextValue>(() => ({
    state: { loading },
    setLoading,
  }), [loading]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return ctx;
}