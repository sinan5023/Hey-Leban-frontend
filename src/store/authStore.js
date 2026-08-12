

import { create } from "zustand";
import api from "../services/api";
import { useSessionStore } from "./sessionStore";
import { getShopDetails } from "../services/profileService";

export const useAuthStore = create((set) => ({
  user: null,
  shop: null,
  isAuthenticated: false,
  isAuthLoading: true,

  initializeAuth: async () => {
    try {
      const response = await api.post("/api/auth/refresh", {});
      const { accessToken, user } = response.data.data;

      window.accessToken = accessToken;

      set({
        user: user ?? null,
        isAuthenticated: true,
        isAuthLoading: false,
      });

      // Fetch shop details after successful refresh
      try {
        const shop = await getShopDetails();
        set({ shop });
      } catch {
        // Non-critical — print will just fall back to empty values
      }
    } catch {
      window.accessToken = null;

      set({
        user: null,
        shop: null,
        isAuthenticated: false,
        isAuthLoading: false,
      });
    }
  },

  login: async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    const { accessToken, user } = response.data.data;

    window.accessToken = accessToken;

    set({
      user,
      isAuthenticated: true,
      isAuthLoading: false,
    });

    // Fetch shop details after successful login
    try {
      const shop = await getShopDetails();
      set({ shop });
    } catch {
      // Non-critical
    }

    return user;
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // ignore logout API error
    }

    window.accessToken = null;
    useSessionStore.getState().clearTodaySession();

    set({
      user: null,
      shop: null,
      isAuthenticated: false,
      isAuthLoading: false,
    });
  },

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),

  clearAuth: () => {
    window.accessToken = null;
    useSessionStore.getState().clearTodaySession();

    set({
      user: null,
      shop: null,
      isAuthenticated: false,
      isAuthLoading: false,
    });
  },
}));