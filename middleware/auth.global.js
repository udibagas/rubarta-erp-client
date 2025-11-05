export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client side after hydration
  if (process.server) return;

  const { isAuthenticated, user } = useAuth();

  console.log("Auth middleware:", {
    to: to.path,
    from: from?.path,
    isAuthenticated: isAuthenticated.value,
    hasUser: !!user.value,
  });

  // If authenticated and trying to access login page, redirect to home
  if (isAuthenticated.value && user.value && to.path === "/login") {
    console.log("Redirecting authenticated user from login to home");
    return navigateTo("/");
  }

  // If not authenticated and not going to login page, redirect to login
  if ((!isAuthenticated.value || !user.value) && to.path !== "/login") {
    console.log("Redirecting unauthenticated user to login");
    return navigateTo("/login");
  }
});
