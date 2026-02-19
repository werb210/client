import { execSync } from "node:child_process";

try {
  console.log("Running client build...");
  execSync("npm run build", { stdio: "inherit" });
  console.log("✅ Build succeeded");
} catch {
  console.error("❌ Build failed");
  process.exit(1);
}
