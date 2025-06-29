import { runTests } from "./clientDiagnosticSuite";

(async () => {
  console.log("=== CLIENT ↔ STAFF Diagnostic Report ===");
  
  try {
    const report = await runTests();
    console.log(JSON.stringify(report, null, 2)); // for ChatGPT
    
    // Exit with appropriate code
    process.exit(report.status.includes("✅") ? 0 : 1);
  } catch (error) {
    console.error("Diagnostic failed:", error);
    process.exit(1);
  }
})();