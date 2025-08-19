import { runTests } from "../../utils/run";

export function isPalindrome(s: string): boolean {
  const alnum = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let i = 0, j = alnum.length - 1;
  while (i < j) {
    if (alnum[i++] !== alnum[j--]) return false;
  }
  return true;
}

if (require.main === module) {
  runTests("isPalindrome", [
    { input: ["A man, a plan, a canal: Panama"], expected: true },
    { input: ["race a car"], expected: false },
  ], isPalindrome);
}
