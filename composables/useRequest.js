let refreshPromise;

export default () => {
  const config = useRuntimeConfig();
  const router = useRouter();

  const apiFetch = $fetch.create({
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

      if (error.response?.status === 403 && import.meta.client) {
        // Handle 403 forbidden - show an error message
        ElNotification.error({
          message: "You do not have permission to perform this action.",
          title: "Unauthorized",
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

  const refreshAuth = () => {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        const csrfResponse = await apiFetch("/api/auth/csrf", {
          method: "GET",
        });

        await apiFetch("/api/auth/refresh", {
          method: "POST",
          headers: { "csrf-token": csrfResponse.token },
        });
      })().finally(() => {
        refreshPromise = undefined;
      });
    }

    return refreshPromise;
  };

  const clearAuthAndRedirect = () => {
    const { clearAuth } = useAuth();
    clearAuth();
    if (router.currentRoute.value.path !== "/login") {
      navigateTo("/login");
    }
  };

  const getRequestUrl = (request) =>
    typeof request === "string" ? request : request?.url ?? "";

  return async (request, options) => {
    try {
      return await apiFetch(request, options);
    } catch (error) {
      const requestUrl = getRequestUrl(request);
      const shouldRefresh =
        import.meta.client &&
        error.response?.status === 401 &&
        !requestUrl.includes("/api/auth/login") &&
        !requestUrl.includes("/api/auth/2fa") &&
        !requestUrl.includes("/api/auth/refresh") &&
        !requestUrl.includes("/api/auth/csrf");

      if (!shouldRefresh) {
        const isExpectedAuthRejection =
          requestUrl.includes("/api/auth/login") ||
          requestUrl.includes("/api/auth/2fa");
        if (
          import.meta.client &&
          error.response?.status === 401 &&
          !isExpectedAuthRejection &&
          router.currentRoute.value.path !== "/login"
        ) {
          clearAuthAndRedirect();
        }
        throw error;
      }

      try {
        await refreshAuth();
      } catch (refreshError) {
        if (
          refreshError.response?.status === 401 ||
          refreshError.response?.status === 403
        ) {
          clearAuthAndRedirect();
          throw error;
        }

        throw refreshError;
      }

      try {
        return await apiFetch(request, options);
      } catch (retryError) {
        if (retryError.response?.status === 401) {
          clearAuthAndRedirect();
        }
        throw retryError;
      }
    }
  };
};
