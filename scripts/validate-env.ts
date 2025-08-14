// Copyright (c) 2025 Tsutomu FUNADA
// This software is licensed for:
//   - Non-commercial use under the MIT License (see LICENSE-NC.txt)
//   - Commercial use requires a separate commercial license (contact author)
// You may not use this software for commercial purposes under the MIT License.

import fs from "fs";
import path from "path";

const examplePath = path.resolve(__dirname, "../dot-env.example");
// .env.local のパス
// ただし、GitHub Actions では、ダミー(dot-env.ci)をチェックさせる
const localPath =
  process.env.CI_ENV_PATH || path.resolve(__dirname, "../dot-env.ci");

const parseEnv = (content: string) =>
  content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=")[0]);

const exampleVars = parseEnv(fs.readFileSync(examplePath, "utf-8"));
const localVars = parseEnv(fs.readFileSync(localPath, "utf-8"));

const missing = exampleVars.filter((key) => !localVars.includes(key));
const extra = localVars.filter((key) => !exampleVars.includes(key));

if (missing.length > 0) {
  console.error("❌ Missing variables in .env.local:");
  missing.forEach((key) => console.error(`  - ${key}`));
}

if (extra.length > 0) {
  console.warn("⚠️ Extra variables in .env.local (not in dot-env.example):");
  extra.forEach((key) => console.warn(`  - ${key}`));
}

if (missing.length > 0) {
  process.exit(1); // fail CI
} else {
  console.log("✅ .env.local matches dot-env.example");
}
