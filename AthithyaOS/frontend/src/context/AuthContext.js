import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const api = axios.create({ baseURL: API, withCredentials: true });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("athithya_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
const AuthCtx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined=loading, null=guest
  useEffect(() => {
    const t = localStorage.getItem("athithya_token");
    if (!t) { setUser(null); return; }
    api.get("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => { localStorage.removeItem("athithya_token"); setUser(null); });
  }, []);
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("athithya_token", data.token);
    setUser(data.user);
    return data.user;
  };
  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    localStorage.removeItem("athithya_token");
    setUser(null);
  };
  return <AuthCtx.Provider value={{ user, login, logout, api }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
export { api };
