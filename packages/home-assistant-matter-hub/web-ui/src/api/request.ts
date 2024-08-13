export type RequestResponse<T> = [isLoading: boolean, data: T | undefined, error: Error | undefined];

export function useRequest<T>(): RequestResponse<T> {
  return [false, undefined, new Error('Not implemented')];
}
