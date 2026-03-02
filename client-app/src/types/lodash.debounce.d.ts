declare module "lodash.debounce" {
  export default function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait?: number,
    options?: {
      leading?: boolean;
      maxWait?: number;
      trailing?: boolean;
    }
  ): T & { cancel(): void; flush(): ReturnType<T> | undefined };
}
