import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't retry on 401, 403, or 404 errors
          if (
            error?.response?.status === 401 ||
            error?.response?.status === 403 ||
            error?.response?.status === 404
          ) {
            return false;
          }
          return failureCount < 3;
        },
      },
      mutations: {
        retry: (failureCount, error) => {
          // Don't retry mutations on client errors (4xx)
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            return false;
          }
          return failureCount < 3;
        },
      },
    },
  });

  nuxtApp.vueApp.use(VueQueryPlugin, {
    queryClient,
  });
});
