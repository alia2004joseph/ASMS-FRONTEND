import React, { createContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  loginUser as apiLoginUser,
  logoutUser as apiLogoutUser,
  getCurrentUser,
} from "../api/authApi.js";
import {
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setStoredUser,
} from "../utils/authStorage.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount, verify any existing token is still valid and hydrate the user.
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    getCurrentUser()
      .then(({ data }) => {
        setUser(data);
        setStoredUser(data);
      })
      .catch(() => {
        clearTokens();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    setIsLoading(true);
    try {
      const { data } = await apiLoginUser({ email, password });
      setTokens({ access: data.access, refresh: data.refresh });
      setUser(data.user);
      setStoredUser(data.user);
      return data.user;
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "We couldn't sign you in. Check your email and password and try again.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await apiLogoutUser(refreshToken);
    } catch {
      // Logging out client-side regardless of API result.
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const value = {
    user,
    role: user?.role ?? null,
    isAuthenticated: Boolean(user),
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
