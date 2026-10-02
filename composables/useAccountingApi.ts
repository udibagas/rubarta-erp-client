import { useQuery, useQueryClient } from "@tanstack/vue-query";

export const useAccountingQuery = (
  key: string,
  url: string,
  params?: any,
  options: Record<string, any> = {},
) => {
  const request = useRequest();
  const queryClient = useQueryClient();
  const queryKey = computed(() => ["accounting", key, unref(params) ?? {}]);
  const query = useQuery({
    queryKey,
    enabled: options.enabled ?? true,
    queryFn: () =>
      request(url, {
        params: unref(params),
      }),
  });

  const invalidate = async () =>
    queryClient.invalidateQueries({ queryKey: ["accounting"] });

  const send = async (
    url: string,
    method: "POST" | "GET" | "PUT" | "PATCH" | "DELETE" = "POST",
    body?: any,
  ) => {
    const result = await request(url, {
      method,
      ...(body === undefined ? {} : { body }),
    });
    await invalidate();
    return result;
  };

  return {
    ...query,
    rows: computed(() => {
      const result: any = query.data.value;
      if (Array.isArray(result)) return result;
      if (Array.isArray(result?.data)) return result.data;
      return [];
    }),
    request,
    send,
    invalidate,
  };
};

export const accountingErrorMessage = (error: any) =>
  error?.data?.message ?? error?.response?._data?.message ?? "Request failed";
