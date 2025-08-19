import { runTests } from "../utils/run";

/**
 * 1. Two Sum
 * https://leetcode.com/problems/two-sum/
 */
export function twoSum(nums: number[], target: number): [number, number] {
  const pos = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (pos.has(need)) return [pos.get(need)!, i];
    pos.set(nums[i], i);
  }
  return [-1, -1];
}

// TESTS
if (require.main === module) {
  runTests("LeetCode #1 Two Sum", [
    { input: [[2,7,11,15], 9], expected: [0,1] },
    { input: [[3,2,4], 6], expected: [1,2] },
    { input: [[3,3], 6], expected: [0,1] },
  ], twoSum);
}
