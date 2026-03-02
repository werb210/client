import { execSync } from "node:child_process";

try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("✅ Build smoke test passed");
} catch {
  console.error("❌ Smoke test failed");
  process.exit(1);
}
