export default () => {
  const config = useRuntimeConfig();

  return $fetch.create({
    baseURL: config.public.apiBase,
    credentials: "include", // This ensures cookies are sent with requests
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    onResponseError: (error) => {
      ElMessage({
        message: error.response._data.message,
        type: "error",
        showClose: true,
      });

      // Handle 401 unauthorized - redirect to login
      if (error.response?.status === 401 && process.client) {
        // Clear auth store and redirect to login
        const { clearAuth } = useAuth();
        clearAuth();
        navigateTo("/login");
      }
    },
  });
};
