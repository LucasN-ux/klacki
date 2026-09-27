// One promise per key for the whole visit: a file is downloaded once. A
// failed promise is dropped, so "try again" really asks again.
export type Resource<T> = { load(key: string): Promise<T> };

export function createResource<T>(
  fetcher: (key: string) => Promise<T>,
): Resource<T> {
  const promises = new Map<string, Promise<T>>();
  return {
    load(key) {
      const known = promises.get(key);
      if (known) return known;
      const promise = fetcher(key).catch((error: unknown) => {
        promises.delete(key);
        throw error;
      });
      promises.set(key, promise);
      return promise;
    },
  };
}
