import { createContext, useContext, useState } from "react";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return { id: decoded.id, username: decoded.username, role: decoded.role };
    } catch {
      return null;
    }
  });

  const login = async (username, password) => {
    const res = await api.post("comptes/login/", { username, password });
    sessionStorage.setItem("access_token", res.data.access);
    sessionStorage.setItem("refresh_token", res.data.refresh);
    const decoded = jwtDecode(res.data.access);
    setUser({ id: decoded.id, username: decoded.username, role: decoded.role });
    return decoded.role;
  };

  const logout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}