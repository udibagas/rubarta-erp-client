export const useCsrf = () => {
  const request = useRequest();

  const fetchCsrfToken = async () => {
    const response = await request<{ token: string }>("/api/auth/csrf", {
      method: "GET",
    });
    return response.token;
  };

  const csrfHeaders = async () => ({
    "csrf-token": await fetchCsrfToken(),
  });

  return { fetchCsrfToken, csrfHeaders };
};
