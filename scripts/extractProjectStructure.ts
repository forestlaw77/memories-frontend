// scripts/extractProjectStructure.ts
import fs from "fs";
import path from "path";

const rootDir = process.cwd();

function readJSON(filePath: string) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function listDirs(base: string): string[] {
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function checkExists(file: string): boolean {
  return fs.existsSync(path.join(rootDir, file));
}

function extract() {
  const pkg = readJSON(path.join(rootDir, "package.json"));
  const dependencies = Object.assign(
    {},
    pkg?.dependencies,
    pkg?.devDependencies
  );

  const techStack = Object.keys(dependencies).filter((dep) =>
    [
      "react",
      "next",
      "zustand",
      "tanstack-query",
      "@chakra-ui/react",
      "storybook",
      "typedoc",
      "jest",
    ].some((lib) => dep.includes(lib))
  );

  const dirs = listDirs(rootDir);
  const srcDirs = checkExists("src") ? listDirs(path.join(rootDir, "src")) : [];

  const configFiles = [
    "next.config.js",
    "tsconfig.json",
    ".storybook",
    ".env",
    ".env.local",
    ".env.production",
  ].filter(checkExists);

  return {
    techStack,
    topLevelDirs: dirs,
    srcDirs,
    configFiles,
  };
}

console.log(JSON.stringify(extract(), null, 2));
