export default defineNuxtPlugin(async () => {
  const { initAuth } = useAuth();

  // Initialize auth store on app start
  if (import.meta.client) {
    await initAuth();
  }
});
