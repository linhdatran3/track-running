export type PathParams<S extends string> =
  S extends `${string}{${infer P}}${infer R}` ? P | PathParams<R> : never;

export function buildEndpoint<T extends string>(
  template: T,
  path: Record<PathParams<T>, string | number | undefined> = {} as never,
  query?: Record<string, string | number | boolean | null | undefined>
): string {
  const url = template.replace(/{(\w+)}/g, (_m, key: string) => {
    const v = (path as never)[key];
    if (v == null) {
      //   throw new Error(
      //     `Missing path param: "${key}" for template "${template}"`
      //   );
      return "";
    }
    return encodeURIComponent(String(v));
  });

  if (!query) return url;
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
    )
    .join("&");
  return qs ? `${url}?${qs}` : url;
}
