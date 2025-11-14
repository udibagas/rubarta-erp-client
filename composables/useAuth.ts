import { useAuthStore } from "~/stores/auth";

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

export const useAuth = () => {
  const authStore = useAuthStore();
  const request = useRequest();
  const router = useRouter();

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log("Login attempt with:", credentials);
      const response = await request<{ user: User }>("/auth/login", {
        method: "POST",
        body: credentials,
      });

      console.log("Login response:", response);

      // With cookie authentication, the server will set the authentication cookie
      // We just need to store the user data
      const { user } = response;
      console.log("Setting user:", user);
      authStore.setUser(user);

      ElMessage({
        message: "Login successful",
        type: "success",
      });

      // Redirect to dashboard or home page after successful login
      console.log("Attempting navigation to /");
      await nextTick();
      console.log("Auth state after nextTick:", {
        isAuthenticated: authStore.isLoggedIn,
        user: authStore.user,
      });
      return navigateTo("/");
    } catch (error) {
      console.error("Login error in composable:", error);
      // Error handling is already done in useRequest onResponseError
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear server-side session/cookie
      await request("/auth/logout", {
        method: "POST",
      }).catch(() => {
        // Ignore logout endpoint errors - still clear local auth
        console.log("Logout endpoint failed, clearing local auth anyway");
      });
    } finally {
      // Clear auth state regardless of API call success
      authStore.clearAuth();

      ElMessage({
        message: "Logged out successfully",
        type: "success",
      });

      // Redirect to login page
      return navigateTo("/login");
    }
  };

  const fetchUser = async () => {
    try {
      // With cookie auth, we don't need to send any token - cookies are automatic
      const user = await request<User>("/auth/me", {
        method: "GET",
      });

      authStore.setUser(user);
      return user;
    } catch (error) {
      // If fetching user fails, clear auth (session might be invalid)
      authStore.clearAuth();
      if (router.currentRoute.value.path !== "/login") {
        navigateTo("/login");
      }
      throw error;
    }
  };

  const checkAuth = () => {
    return authStore.isLoggedIn;
  };

  const initAuth = async () => {
    // With cookie auth, we try to fetch user data to check if session is valid
    try {
      await fetchUser();
    } catch (error) {
      // If fetching user fails, session is invalid
      console.log("No valid session found");
    }
  };

  const clearAuth = () => {
    authStore.clearAuth();
  };

  return {
    // State
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isLoggedIn),

    // Methods
    login,
    logout,
    fetchUser,
    checkAuth,
    initAuth,
    clearAuth,
  };
};

// For backward compatibility
export const useSanctumAuth = useAuth;
