"use client";

const TOKEN_KEY = "adminAccessToken";
const REFRESH_KEY = "adminRefreshToken";
const USER_KEY = "adminUser";

export const saveAuth = (accessToken, refreshToken, user) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export const getCurrentUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
};
export const isAdmin = () => getCurrentUser()?.role === "ADMIN";
export const isAuthenticated = () => !!getAccessToken() && isAdmin();
