export const useSharedStore = defineStore("shared", () => {
  const companyId = computed(() => useCookie("companyId").value || null);
  return { companyId };
});
