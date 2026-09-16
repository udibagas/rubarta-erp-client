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
      if (error.response?.status === 400 && import.meta.client) {
        // Handle 400 bad request - show validation errors
        const messages = [];

        if (error.response?._data?.errors) {
          error.response._data.errors.forEach((e) => {
            if (e.error) {
              messages.push(
                `<li class="text-red-500 list-disc">${e.error}</li>`,
              );
            }

            if (e.children) {
              e.children.forEach((child) => {
                for (let i = 0; i < child.children.length; i++) {
                  const c = child.children[i];
                  if (c.error) {
                    messages.push(
                      `<li class="text-red-500 list-disc">${c.error}</li>`,
                    );
                  }
                }
              });
            }
          });
        }

        const messageList = messages.join("");

        ElNotification.error({
          title: error.response?._data.message || "Error",
          dangerouslyUseHTMLString: true,
          message: `<ul>${messageList}</ul>`,
        });
      }

      // Handle 401 unauthorized - redirect to login
      if (error.response?.status === 401 && import.meta.client) {
        // Clear auth store and redirect to login
        const { clearAuth } = useAuth();
        clearAuth();
        navigateTo("/login");
      }

      if (error.response?.status === 403 && import.meta.client) {
        // Handle 403 forbidden - show an error message
        ElMessage({
          message: "You do not have permission to perform this action.",
          type: "error",
          showClose: true,
        });
      }

      if (error.response?.status === 500 && import.meta.client) {
        // Handle 500 internal server error
        ElNotification.error({
          title: "Internal Server Error",
          message: "An unexpected error occurred. Please try again later.",
        });
      }
    },
  });
};
