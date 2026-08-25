import type { TypedDocumentNode } from "@apollo/client";

export default async function useGraphqlQuery<T>(query: TypedDocumentNode<T>) {
  const { $apollo } = useNuxtApp();
  return $apollo.query({ query });
}
