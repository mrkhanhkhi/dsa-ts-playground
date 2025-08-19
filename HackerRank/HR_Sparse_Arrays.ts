import { runTests } from "../utils/run";

/**
 * HackerRank - Sparse Arrays
 * https://www.hackerrank.com/challenges/sparse-arrays/problem
 */
export function matchingStrings(strings: string[], queries: string[]): number[] {
  const count = new Map<string, number>();
  for (const s of strings) count.set(s, (count.get(s) || 0) + 1);
  return queries.map(q => count.get(q) || 0);
}

// TESTS
if (require.main === module) {
  runTests("HackerRank Sparse Arrays", [
    { input: [[ "aba","baba","aba","xzxb" ], [ "aba","xzxb","ab" ]], expected: [2,1,0] }
  ], matchingStrings);
}
