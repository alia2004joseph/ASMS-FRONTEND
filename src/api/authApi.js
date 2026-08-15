import axiosClient from "./axiosClient.js";
import { ENDPOINTS } from "./endpoints.js";

// All functions return the Axios promise directly so callers can
// handle loading/error state locally with their own try/catch.

export function loginUser({ email, password }) {
  return axiosClient.post(ENDPOINTS.auth.login, { email, password });
}

export function refreshAccessToken(refreshToken) {
  return axiosClient.post(ENDPOINTS.auth.refresh, { refresh: refreshToken });
}

export function signupWithAccessCode(payload) {
  // payload: { accessCode, firstName, lastName, email, password }
  return axiosClient.post(ENDPOINTS.auth.signup, payload);
}

export function requestPasswordReset({ email }) {
  return axiosClient.post(ENDPOINTS.auth.requestPasswordReset, { email });
}

export function getCurrentUser() {
  return axiosClient.get(ENDPOINTS.auth.currentUser);
}

export function logoutUser(refreshToken) {
  return axiosClient.post(ENDPOINTS.auth.logout, { refresh: refreshToken });
}
