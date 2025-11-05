import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),

  getters: {
    getUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated && !!state.user,
  },

  actions: {
    setUser(user) {
      this.user = user;
      this.isAuthenticated = !!user;
    },

    clearAuth() {
      this.user = null;
      this.isAuthenticated = false;
    },
  },
});
