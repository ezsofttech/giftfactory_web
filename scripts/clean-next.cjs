const fs = require("node:fs");
const path = require("node:path");

const nextDir = path.resolve(process.cwd(), ".next");

try {
  fs.rmSync(nextDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  console.log("Cleaned .next directory");
} catch (error) {
  console.error("Failed to clean .next directory", error);
  process.exit(1);
}
