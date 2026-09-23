import { createContext, useContext, useState, useMemo, useCallback } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("accessToken"));
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem("accessToken")));
  const [isLoading] = useState(false);

  const login = useCallback((accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    setToken(accessToken);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    setToken(null);
    setIsAuthenticated(false);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      token,
      isAuthenticated,
      isLoading,
      login,
      logout,
    }),
    [token, isAuthenticated, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
