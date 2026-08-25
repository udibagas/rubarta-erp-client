import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export default defineNuxtPlugin(() => {
  const client = new ApolloClient({
    link: new HttpLink({
      uri:
        (import.meta.env.VITE_API_URL || "http://localhost:3000") + "/graphql",
      credentials: "include",
    }),
    cache: new InMemoryCache(),
  });

  return {
    provide: {
      apollo: client,
    },
  };
});
