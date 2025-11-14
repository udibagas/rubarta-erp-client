import { defineStore } from "pinia";

interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
  }),

  getters: {
    getUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated && !!state.user,
  },

  actions: {
    setUser(user: User) {
      this.user = user;
      this.isAuthenticated = !!user;
    },

    clearAuth() {
      this.user = null;
      this.isAuthenticated = false;
    },
  },
});
