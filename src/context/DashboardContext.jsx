// src/context/DashboardContext.jsx
import { createContext, useContext, useState } from "react";

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <DashboardContext.Provider value={{ refreshKey, refresh }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardRefresh() {
  return useContext(DashboardContext); // ⬅️ harus return object
}
