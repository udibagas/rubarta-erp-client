import type { TypedDocumentNode } from "@apollo/client";

export default async function useGraphqlQuery<T>(
  query: TypedDocumentNode<T>,
  options: Record<string, any> = {},
) {
  const { $apollo } = useNuxtApp();
  return $apollo.query({ query, ...options });
}
