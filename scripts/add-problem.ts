#!/usr/bin/env ts-node
/**
 * add-problem.ts
 * Generate LeetCode / HackerRank TypeScript solution files.
 *
 * Examples:
 *   npx ts-node scripts/add-problem.ts lc 27
 *   npx ts-node scripts/add-problem.ts hr --slug balanced-brackets --title "Balanced Brackets"
 */

import * as fs from "fs";
import * as path from "path";
import * as https from "https";

function pad4(n: number){ return String(n).padStart(4, "0"); }
function toSafeName(s: string){ return (s || "Problem").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g,""); }
function writeFileIfAbsent(filePath: string, content: string){
  if (fs.existsSync(filePath)) {
    console.error("File already exists:", filePath);
    process.exit(1);
  }
  fs.writeFileSync(filePath, content, "utf8");
  console.log("✓ Created:", filePath);
}

function fetchJSON<T=any>(options: https.RequestOptions, body: string|null=null): Promise<T|null> {
  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch { resolve(null); }
      });
    });
    req.on("error", () => resolve(null));
    if (body) req.write(body);
    req.end();
  });
}

function fetchLeetCodeMetaByNumber(number: number){
  const options: https.RequestOptions = {
    hostname: "leetcode.com",
    path: "/api/problems/algorithms/",
    method: "GET",
    headers: { "User-Agent": "Mozilla/5.0" }
  };
  return fetchJSON<any>(options).then(json => {
    if (!json || !Array.isArray(json.stat_status_pairs)) return null;
    const found = json.stat_status_pairs.find((x: any) => x.stat && x.stat.frontend_question_id === Number(number));
    if (!found) return null;
    return { title: found.stat.question__title as string, slug: found.stat.question__title_slug as string };
  });
}

async function fetchLeetCodeJSStarterBySlug(slug: string){
  const query = JSON.stringify({
    operationName: "questionData",
    variables: { titleSlug: slug },
    query: "query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { codeDefinition title questionFrontendId }}"
  });
  const options: https.RequestOptions = {
    hostname: "leetcode.com",
    path: "/graphql",
    method: "POST",
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(query)
    }
  };
  const json = await fetchJSON<any>(options, query);
  if (!json || !json.data || !json.data.question) return null;
  let codeDef = json.data.question.codeDefinition;
  try { if (typeof codeDef === "string") codeDef = JSON.parse(codeDef); } catch {}
  if (!Array.isArray(codeDef)) return null;
  const jsDef = codeDef.find((d: any) =>
    (d.value && String(d.value).toLowerCase() === "javascript") ||
    (d.lang && String(d.lang).toLowerCase() === "javascript")
  );
  if (!jsDef) return null;
  return { starter: jsDef.defaultCode || jsDef.code || "", title: json.data.question.title as string, id: json.data.question.questionFrontendId as string };
}

function extractFunctionName(src: string): string {
  const patterns = [
    /var\s+([A-Za-z_$][\w$]*)\s*=\s*function\b/,
    /const\s+([A-Za-z_$][\w$]*)\s*=\s*function\b/,
    /let\s+([A-Za-z_$][\w$]*)\s*=\s*function\b/,
    /function\s+([A-Za-z_$][\w$]*)\s*\(/,
  ];
  for (const re of patterns){
    const m = src.match(re);
    if (m) return m[1];
  }
  return "solve";
}

function extractParamsList(src: string): string[] {
  const m = src.match(/function\s+[A-Za-z_$][\w$]*\s*\(([^)]*)\)/) || src.match(/=\s*function\s*\(([^)]*)\)/);
  if (m && m[1].trim()) {
    return m[1].split(",").map(s => s.trim()).filter(Boolean);
  }
  return ["/* args */"];
}

function mapJsDocToTs(t: string): string {
  const lower = t.toLowerCase();
  if (lower.includes("number[]")) return "number[]";
  if (lower.includes("string[]")) return "string[]";
  if (lower.includes("boolean[]")) return "boolean[]";
  if (lower.includes("number")) return "number";
  if (lower.includes("string")) return "string";
  if (lower.includes("boolean")) return "boolean";
  return "any";
}

function extractParamTypesFromJsDoc(src: string): Record<string,string> {
  const types: Record<string,string> = {};
  const re = /@param\s*\{([^}]+)\}\s*([A-Za-z_$][\w$]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const ts = mapJsDocToTs(m[1]);
    const name = m[2];
    types[name] = ts;
  }
  const ret = /@return\s*\{([^}]+)\}/.exec(src);
  if (ret) types["__return__"] = mapJsDocToTs(ret[1]);
  return types;
}

function makeTsSignature(fnName: string, params: string[], jsdocTypes: Record<string,string>): string {
  const args = params.map(p => `${p}: ${jsdocTypes[p] || "any"}`).join(", ");
  const ret = jsdocTypes["__return__"] || "any";
  return `export function ${fnName}(${args}): ${ret} {`;
}

function buildArgsPlaceholder(params: string[]): string {
  if (params.length === 0 || (params.length === 1 && params[0] === "/* args */")) return "[ /* args */ ]";
  if (params.length === 1) return `[ /* ${params[0]} */ ]`;
  return `[[ ${params.map(p => `/* ${p} */`).join(", ")} ]]`;
}

function tsifyStarter(starter: string, title: string, id?: string){
  const fn = extractFunctionName(starter);
  const params = extractParamsList(starter);
  const types = extractParamTypesFromJsDoc(starter);
  const bodyMatch = starter.match(/\{\s*([\s\S]*)\}\s*;?\s*$/);
  const body = bodyMatch ? bodyMatch[1].trim() : "// TODO";
  const signature = makeTsSignature(fn, params, types);
  const urlMatch = starter.match(/https?:\/\/leetcode\.com\/problems\/[^\s*]+/);
  const url = urlMatch ? urlMatch[0] : "";

  const header = `import { runTests } from "../utils/run";

/**
 * ${id ? `${id}. ` : ""}${title}
 * ${url}
 */
${signature}
  ${body}
}
`;
  const argsPlaceholder = buildArgsPlaceholder(params);
  const tests = `
// TESTS
if (require.main === module) {
  runTests("LeetCode #${id || "?"} ${title}", [
    { input: ${argsPlaceholder}, expected: /* result */ }
  ], ${fn});
}
`;
  return header + tests;
}

function lcFallbackTS(number: number, title: string, slug?: string){
  return `import { runTests } from "../utils/run";

/**
 * ${number}. ${title}
 * ${slug ? `https://leetcode.com/problems/${slug}/` : ""}
 */
export function solve(/* args */): any {
  // TODO
  return null;
}

// TESTS
if (require.main === module) {
  runTests("LeetCode #${number} ${title}", [
    { input: [ /* args */ ], expected: /* result */ }
  ], solve);
}
`;
}

async function main(){
  const args = process.argv.slice(2);
  const platform = args[0];
  if (!platform) {
    console.log("Usage: npx ts-node scripts/add-problem.ts <lc|hr> ...");
    process.exit(0);
  }
  const flags: Record<string, any> = {};
  for (let i=1;i<args.length;i++){
    const a = args[i];
    if (a.startsWith("--")) {
      const k = a.slice(2);
      const v = args[i+1] && !args[i+1].startsWith("--") ? args[++i] : true;
      flags[k] = v;
    } else {
      (flags._ ||= []).push(a);
    }
  }
  const root = process.cwd();

  if (platform === "lc" || platform === "leetcode") {
    const number = Number(flags._ && flags._[0]);
    if (!number) { console.error("Please provide a LeetCode problem number."); process.exit(1); }
    let title = flags.title as string | undefined, slug = flags.slug as string | undefined;

    if (!title || !slug) {
      const meta = await fetchLeetCodeMetaByNumber(number);
      if (meta) { title = title || meta.title; slug = slug || meta.slug; }
    }
    let tsContent: string;
    if (slug) {
      const st = await fetchLeetCodeJSStarterBySlug(slug);
      if (st && st.starter) {
        tsContent = tsifyStarter(st.starter, title || st.title, st.id || String(number));
        title = title || st.title;
      } else {
        tsContent = lcFallbackTS(number, title || `Problem ${number}`, slug);
      }
    } else {
      tsContent = lcFallbackTS(number, title || `Problem ${number}`, slug);
    }
    const fname = `LC_${pad4(number)}_${toSafeName(title || `Problem_${number}`)}.ts`;
    const outPath = path.join(root, "LeetCode", fname);
    writeFileIfAbsent(outPath, tsContent);
  }
  else if (platform === "hr" || platform === "hackerrank") {
    const slug = flags.slug as string | undefined;
    const title = (flags.title as string) || (slug ? slug.split("-").map(s => s[0].toUpperCase()+s.slice(1)).join(" ") : "Problem");
    const safeTitle = toSafeName(title);
    const url = slug ? `https://www.hackerrank.com/challenges/${slug}/problem` : "https://www.hackerrank.com/";
    const content = `import { runTests } from "../utils/run";

/**
 * HackerRank - ${title}
 * ${url}
 */
export function ${safeTitle}(/* args */): any {
  // TODO
  return null;
}

// TESTS
if (require.main === module) {
  runTests("HackerRank ${title}", [
    { input: [ /* args */ ], expected: /* result */ }
  ], ${safeTitle});
}
`;
    const outPath = path.join(root, "HackerRank", `HR_${safeTitle}.ts`);
    writeFileIfAbsent(outPath, content);
  }
  else {
    console.error("Unknown platform. Use 'lc' or 'hr'.");
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
