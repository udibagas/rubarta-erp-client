export function useNewQuery(openForm: () => void) {
  const route = useRoute();
  const router = useRouter();

  watch(
    () => route.query.new,
    async (value) => {
      if (value !== "true") return;

      await nextTick();

      // Delay opening the form to ensure the DOM is updated
      setTimeout(() => {
        openForm();
      }, 100);

      const query = { ...route.query };
      delete query.new;
      await router.replace({ query });
    },
    { immediate: true },
  );
}
