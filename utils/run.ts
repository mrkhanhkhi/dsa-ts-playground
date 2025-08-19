import { assertEqual } from "./assert";

/**
 * Run a list of test cases against a function.
 * Each test is { input, expected, label? }. If input is an array, it will be spread.
 */
export function runTests<T extends any[]>(
  name: string,
  tests: Array<{ input: any; expected: any; label?: string }>,
  fn: (...args: any[]) => any
): void {
  console.log(`\n— ${name} —`);
  for (const t of tests) {
    const { input, expected, label } = Array.isArray(t) ? { input: (t as any)[0], expected: (t as any)[1], label: (t as any)[2] } : t;
    const actual = Array.isArray(input) ? fn(...input) : fn(input);
    assertEqual(actual, expected, label || JSON.stringify(input));
  }
}
