#!/usr/bin/env node
/**
 * 민감한 환경변수가 NEXT_PUBLIC_ 접두사로 노출되었는지 검사한다.
 * npm run verify 에서 호출된다.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SENSITIVE_PATTERNS = [
  /NEXT_PUBLIC_.*OPENAI/i,
  /NEXT_PUBLIC_.*TOGETHER/i,
  /NEXT_PUBLIC_.*SERVICE_ROLE/i,
  /NEXT_PUBLIC_.*SECRET/i,
  /NEXT_PUBLIC_.*PRIVATE/i,
];

const SCAN_DIRS = ["src", ".env", ".env.local", ".env.production"];

let violations = [];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, i) => {
      SENSITIVE_PATTERNS.forEach((pattern) => {
        if (pattern.test(line)) {
          violations.push(`${filePath}:${i + 1} — ${line.trim()}`);
        }
      });
    });
  } catch {
    // 파일 읽기 실패는 무시
  }
}

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const stat = fs.statSync(dir);
  if (stat.isFile()) {
    scanFile(dir);
    return;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scanDir(full);
    else scanFile(full);
  }
}

for (const target of SCAN_DIRS) {
  scanDir(target);
}

if (violations.length > 0) {
  console.error("\n⚠️  민감정보 NEXT_PUBLIC_ 노출 감지:");
  violations.forEach((v) => console.error("  " + v));
  console.error(
    "\nOPENAI_API_KEY, SERVICE_ROLE_KEY 등은 NEXT_PUBLIC_ 없이 서버 전용으로 사용하세요.\n"
  );
  process.exit(1);
} else {
  console.log("✅ 환경변수 노출 검사 통과");
}
