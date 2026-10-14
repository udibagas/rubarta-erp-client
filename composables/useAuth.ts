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
  twoFactorEnabled?: boolean;
}

type LoginResponse =
  | { twoFactorRequired: true; challengeId: string }
  | { twoFactorRequired?: false; token: string; user: User };

interface AuthResponse {
  token: string;
  user: User;
}

export const useAuth = () => {
  const authStore = useAuthStore();
  const request = useRequest();
  const { csrfHeaders } = useCsrf();
  const router = useRouter();

  const login = async (credentials: LoginCredentials) => {
    const response = await request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: credentials,
      headers: await csrfHeaders(),
    });

    if (response.twoFactorRequired) {
      return response;
    }

    const { user } = response;
    authStore.setUser(user);

    ElMessage({
      message: "Login successful",
      type: "success",
    });

    await nextTick();
    await navigateTo("/");
    return { twoFactorRequired: false as const };
  };

  const verifyTwoFactor = async (challengeId: string, code: string) => {
    const response = await request<AuthResponse>("/api/auth/2fa/verify", {
      method: "POST",
      body: { challengeId, code },
      headers: await csrfHeaders(),
    });

    authStore.setUser(response.user);
    ElMessage({
      message: "Login successful",
      type: "success",
    });
    await navigateTo("/");
  };

  const setTwoFactorEnabled = async (enabled: boolean, password: string) => {
    const response = await request<{ twoFactorEnabled: boolean }>(
      "/api/auth/2fa",
      {
        method: "POST",
        body: { enabled, password },
        headers: await csrfHeaders(),
      },
    );

    if (authStore.user) {
      authStore.setUser({
        ...authStore.user,
        twoFactorEnabled: response.twoFactorEnabled,
      });
    }

    return response.twoFactorEnabled;
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear server-side session/cookie
      await request("/api/auth/logout", {
        method: "POST",
        headers: await csrfHeaders(),
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
      const user = await request<User>("/api/auth/me", {
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
    verifyTwoFactor,
    setTwoFactorEnabled,
    logout,
    fetchUser,
    checkAuth,
    initAuth,
    clearAuth,
  };
};
