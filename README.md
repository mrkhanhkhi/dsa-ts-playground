# DSA TS Playground

A scaffold to learn & practice **Data Structures and Algorithms (DSA)** in **TypeScript (Node.js)**.

- Three main folders: **Theory**, **LeetCode**, **HackerRank**.
- Each **`.ts` file** can be run/debugged independently (via `ts-node` or VS Code F5).
- Includes **VS Code launch config** to quickly run the currently opened file.
- Comes with a generator script to create new problem files.

## Requirements
- Node.js >= 18
- VS Code (recommended)

## Install
```bash
npm install
```

## Run examples
```bash
# Run any TS file with ts-node
npx ts-node Theory/arrays/array.ts
npx ts-node LeetCode/LC_0001_Two_Sum.ts
npx ts-node HackerRank/HR_Sparse_Arrays.ts

# Or via VS Code: open this folder → F5 → "Run current TS file"
```

## Project structure (simplified)
```
dsa-ts-playground/
  .vscode/launch.json
  tsconfig.json
  utils/
    assert.ts
    run.ts
  Theory/
    arrays/array.ts
    strings/strings.ts
    linked-list/linkedList.ts
    ... (more topics)
  LeetCode/
    LC_0001_Two_Sum.ts
  HackerRank/
    HR_Sparse_Arrays.ts
  scripts/
    add-problem.ts
```

## Create new problem file (generator)
CLI: `scripts/add-problem.ts`

### LeetCode (provide problem number)
```bash
# Attempts to fetch official JS starter code & params, converts to TS, scaffolds runTests
npx ts-node scripts/add-problem.ts lc 27

# Or specify manually
npx ts-node scripts/add-problem.ts lc 53 --title "Maximum Subarray" --slug maximum-subarray
```

### HackerRank
> HackerRank does not have official numbering like LeetCode, so it is recommended to pass `--slug` or `--title`.
```bash
npx ts-node scripts/add-problem.ts hr --slug balanced-brackets --title "Balanced Brackets"
```

### NPM aliases
```bash
npm run add:lc -- 27
npm run add:hr -- --slug balanced-brackets --title "Balanced Brackets"
```

## Notes
- The LeetCode generator tries to fetch the official **JavaScript starter code** (function signature) via GraphQL, parses JSDoc types, and creates a **TypeScript** file with types when possible. It also scaffolds a **runTests** block with parameter placeholders.
- If fetching fails, it falls back to a minimal TS template.
# dsa-ts-playground
