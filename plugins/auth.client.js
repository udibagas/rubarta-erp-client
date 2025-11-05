export default defineNuxtPlugin(async () => {
  const { initAuth } = useAuth();

  // Initialize auth store on app start
  if (process.client) {
    await initAuth();
  }
});
