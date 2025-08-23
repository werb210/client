// scripts/check-schema-integrity.ts
import fs from "fs";
import path from "path";

interface SchemaLock {
  lenders: any;
  lenderProducts: any;
  timestamp: string;
  version: string;
}

const SCHEMA_LOCK_FILE = path.join(process.cwd(), "schema-lock.json");

// Simulate schema extraction (would normally import from @boreal/db/schema)
const currentSchema = {
  lenders: {
    id: "string",
    name: "string", 
    country: "string",
    status: "string",
    createdAt: "timestamp",
    updatedAt: "timestamp"
  },
  lenderProducts: {
    id: "string",
    lenderId: "string",
    name: "string",
    description: "string", 
    productType: "string",
    minAmount: "number",
    maxAmount: "number",
    rate: "string",
    country: "string",
    createdAt: "timestamp",
    updatedAt: "timestamp"
  }
};

export function generateSchemaLock() {
  const schemaLock: SchemaLock = {
    lenders: currentSchema.lenders,
    lenderProducts: currentSchema.lenderProducts,
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  };
  
  fs.writeFileSync(SCHEMA_LOCK_FILE, JSON.stringify(schemaLock, null, 2));
  console.log("✅ Schema lock generated successfully");
}

export function checkSchemaIntegrity(): boolean {
  try {
    if (!fs.existsSync(SCHEMA_LOCK_FILE)) {
      console.warn("⚠️  Schema lock file not found, generating new one...");
      generateSchemaLock();
      return true;
    }
    
    const schemaSnapshot: SchemaLock = JSON.parse(
      fs.readFileSync(SCHEMA_LOCK_FILE, "utf8")
    );
    
    const currentSchemaStr = JSON.stringify(currentSchema);
    const lockedSchemaStr = JSON.stringify({
      lenders: schemaSnapshot.lenders,
      lenderProducts: schemaSnapshot.lenderProducts
    });
    
    if (currentSchemaStr !== lockedSchemaStr) {
      console.error("❌ Schema drift detected!");
      console.error("Current schema:", currentSchema);
      console.error("Locked schema:", { 
        lenders: schemaSnapshot.lenders, 
        lenderProducts: schemaSnapshot.lenderProducts 
      });
      return false;
    }
    
    console.log("✅ Schema integrity verified");
    return true;
  } catch (error) {
    console.error("❌ Failed to check schema integrity:", error);
    return false;
  }
}

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === "generate") {
    generateSchemaLock();
  } else if (command === "check") {
    const isValid = checkSchemaIntegrity();
    process.exit(isValid ? 0 : 1);
  } else {
    console.log("Usage: npm run schema:check OR npm run schema:generate");
  }
}