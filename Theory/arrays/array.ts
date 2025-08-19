import { runTests } from "../../utils/run";

export function removeDuplicatesSorted(nums: number[]): number {
  if (nums.length === 0) return 0;
  let write = 1;
  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[read - 1]) {
      nums[write++] = nums[read];
    }
  }
  return write;
}

if (require.main === module) {
  const a = [0,0,1,1,1,2,2,3,3,4];
  const len = removeDuplicatesSorted(a);
  console.log("✓ length:", len, "prefix:", a.slice(0, len));
}
