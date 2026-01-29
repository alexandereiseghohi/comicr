export type MockChain<T = unknown> = {
  limit: (n?: number) => Promise<T[]>;
  where: (..._args: unknown[]) => MockChain<T>;
  from: (..._args: unknown[]) => MockChain<T>;
  select: (..._args: unknown[]) => MockChain<T>;
  leftJoin?: (..._args: unknown[]) => MockChain<T>;
  rightJoin?: (..._args: unknown[]) => MockChain<T>;
  offset?: (n?: number) => Promise<T[]>;
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
