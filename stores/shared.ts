export const useSharedStore = defineStore("shared", () => {
  const companyId = ref<number | string | null>(
    useCookie("companyId").value || null,
  );
  return { companyId };
});
