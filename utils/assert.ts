export function isDeepEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function assertEqual(actual: any, expected: any, message = ""): void {
  if (!isDeepEqual(actual, expected)) {
    console.error("✗", message || "Assertion failed");
    console.error("  expected:", expected);
    console.error("  actual  :", actual);
    process.exitCode = 1;
  } else {
    console.log("✓", message || "OK");
  }
}
