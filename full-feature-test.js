#!/usr/bin/env node

/**
 * Boreal Financial — Full Feature Test Suite
 *
 * Tests both STAFF and CLIENT apps, reports pass/fail per feature.
 */

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const STAFF_API = process.env.STAFF_URL || "https://staff.boreal.financial/api";
const CLIENT_URL = process.env.CLIENT_URL || "https://client.boreal.financial";

const endpoints = {
  staff: {
    health: `${STAFF_API}/_int/health`,
    applications: `${STAFF_API}/public/applications`,
    documents: `${STAFF_API}/applications/:id/documents`,
    s3: `${STAFF_API}/s3-documents-new/upload`,
    signnow: `${STAFF_API}/public/signnow/initiate/:id`,
    chat: `${STAFF_API}/chat`,
    lenderProducts: `${STAFF_API}/lender-products`,
  },
  client: {
    home: `${CLIENT_URL}/`,
    formSubmit: `${CLIENT_URL}/api/public/applications`,
    upload: `${CLIENT_URL}/api/applications/:id/documents/upload`,
    chatbot: `${CLIENT_URL}/api/chat`,
  },
};

const results = [];

/**
 * Generic tester
 */
async function testEndpoint(name, url, options = {}) {
  try {
    const res = await fetch(url, { method: options.method || "GET", ...options });
    const status = res.status;

    results.push({ feature: name, url, status, ok: status >= 200 && status < 300 });

    if (status >= 400) {
      console.error(`❌ ${name} → ${status}`);
    } else {
      console.log(`✅ ${name} → ${status}`);
    }
  } catch (err) {
    results.push({ feature: name, url, status: "FAILED", ok: false, error: err.message });
    console.error(`💥 ${name} → ${err.message}`);
  }
}

/**
 * STAFF TESTS
 */
async function runStaffTests() {
  console.log("\n=== STAFF APP TESTS ===\n");
  await testEndpoint("Staff Healthcheck", endpoints.staff.health);
  await testEndpoint("Application Submissions", endpoints.staff.applications, {
    method: "POST",
    body: JSON.stringify({ fake: "data" }),
    headers: { "Content-Type": "application/json" },
  });
  await testEndpoint("Chatbot API", endpoints.staff.chat, {
    method: "POST",
    body: JSON.stringify({ message: "Hello" }),
    headers: { "Content-Type": "application/json" },
  });
  await testEndpoint("S3 Upload Route", endpoints.staff.s3, { method: "POST" });
  await testEndpoint("SignNow Init", endpoints.staff.signnow.replace(":id", "123"));
  await testEndpoint("Lender Products", endpoints.staff.lenderProducts);
}

/**
 * CLIENT TESTS
 */
async function runClientTests() {
  console.log("\n=== CLIENT APP TESTS ===\n");
  await testEndpoint("Home Page", endpoints.client.home);
  await testEndpoint("Application Submit", endpoints.client.formSubmit, {
    method: "POST",
    body: JSON.stringify({ fake: "data" }),
    headers: { "Content-Type": "application/json" },
  });
  await testEndpoint("Document Upload", endpoints.client.upload.replace(":id", "123"), {
    method: "POST",
  });
  await testEndpoint("Chatbot API", endpoints.client.chatbot, {
    method: "POST",
    body: JSON.stringify({ message: "Hi" }),
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * FINAL REPORT
 */
async function writeReport() {
  const failed = results.filter((r) => !r.ok);
  const reportPath = path.resolve("./tmp/full_feature_report.json");
  const markdownPath = path.resolve("./tmp/full_feature_report.md");

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  const md = [
    `# Boreal Financial Full Feature Report`,
    `\n## Results\n`,
    ...results.map((r) =>
      r.ok
        ? `✅ **${r.feature}** — OK (${r.status})`
        : `❌ **${r.feature}** — FAILED (${r.status || r.error})`
    ),
    `\n---\n**Total:** ${results.length} | **Failed:** ${failed.length}`,
  ].join("\n");

  fs.writeFileSync(markdownPath, md);

  console.log(`\n📄 Reports saved:`);
  console.log(`- JSON: ${reportPath}`);
  console.log(`- Markdown: ${markdownPath}`);
}

/**
 * RUN EVERYTHING
 */
(async () => {
  await runStaffTests();
  await runClientTests();
  await writeReport();
})();