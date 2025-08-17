/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import fs from "fs";
import path from "path";

const examplePath = path.resolve(__dirname, "../dot-env.example");
const ciPath = path.resolve(__dirname, "../dot-env.ci");

const content = fs.readFileSync(examplePath, "utf-8");

const lines = content.split("\n").map((line) => {
  if (line.trim().startsWith("#") || line.trim() === "") return line;
  const [key] = line.split("=");
  return `${key}=dummy_value`;
});

fs.writeFileSync(ciPath, lines.join("\n"), "utf-8");
console.log("✅ dot_env.ci generated from dot_env.example");
