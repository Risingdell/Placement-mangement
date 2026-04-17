import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("token"));

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    localStorage.setItem("token", response.token);

    // Check if the response matches what we expect from backend
    // Typically backend returns { token: "...", user: { role: "admin", ... } }
    if (response.user) {
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
    }

    setToken(response.token);
    setIsAuthenticated(true);
    return response; // Return entire response so components can check roles
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
