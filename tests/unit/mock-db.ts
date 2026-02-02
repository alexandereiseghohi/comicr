export type MockChain<T = unknown> = {
  from: (..._args: unknown[]) => MockChain<T>;
  leftJoin?: (..._args: unknown[]) => MockChain<T>;
  limit: (n?: number) => Promise<T[]>;
  offset?: (n?: number) => Promise<T[]>;
  rightJoin?: (..._args: unknown[]) => MockChain<T>;
  select: (..._args: unknown[]) => MockChain<T>;
  where: (..._args: unknown[]) => MockChain<T>;
};

export function createMockChain<T = unknown>(data: T[]): MockChain<T> {
  const chain: MockChain<T> = {
    limit: async () => data,
    where: () => chain,
    from: () => chain,
    select: () => chain,
    leftJoin: () => chain,
    rightJoin: () => chain,
    offset: async () => data,
  };
  return chain;
}
