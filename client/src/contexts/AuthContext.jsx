import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("simpar_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("simpar_token");
    if (token) {
      api.get("/auth/me")
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem("simpar_user", JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem("simpar_token");
          localStorage.removeItem("simpar_user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data;
    localStorage.setItem("simpar_token", token);
    localStorage.setItem("simpar_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch (_) {}
    localStorage.removeItem("simpar_token");
    localStorage.removeItem("simpar_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
