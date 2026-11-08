import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem("trollyhub_auth");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth) {
      localStorage.setItem("trollyhub_auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("trollyhub_auth");
    }
  }, [auth]);

  const loginStaff = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/staff-login", payload);
      setAuth(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const requestCustomerOtp = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/customer/request-otp", payload);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const verifyCustomerOtp = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/customer/verify-otp", payload);
      setAuth(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      setAuth(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => setAuth(null);

  return (
    <AuthContext.Provider value={{ auth, setAuth, loading, loginStaff, requestCustomerOtp, verifyCustomerOtp, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
