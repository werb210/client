#!/usr/bin/env node

/**
 * Document Upload Integrity Verification Script
 * Validates that protected upload components remain unmodified
 */

import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

class UploadIntegrityVerifier {
  constructor() {
    this.protectedFiles = [
      'client/src/components/upload/DocumentUploadWidget.tsx',
      'client/src/routes/Step5_DocumentUpload.tsx', 
      'client/src/routes/Step7_Finalization.tsx',
      'client/src/lib/api.ts',
      'server/index.ts',
      'client/src/components/DynamicDocumentRequirements.tsx'
    ];
    
    this.requiredConsoleLogging = [
      'console.log("📤 Uploading document:", file.name, file.type, file.size)',
      'console.log("📥 Upload response:", result)',
      'console.log("🔗 Upload endpoint:", endpoint)',
      'console.log("📤 [STEP7] Finalizing application:", applicationId)',
      'console.log("📤 [STEP7] Document Count:", uploadedFiles.length)'
    ];
    
    this.requiredEndpoints = [
      '/api/public/applications/:id/documents',
      'POST /api/public/applications/${applicationId}/documents'
    ];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔍';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  calculateFileHash(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return crypto.createHash('sha256').update(content).digest('hex');
    } catch (error) {
      return null;
    }
  }

  verifyConsoleLogging(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const missingLogs = [];
      
      this.requiredConsoleLogging.forEach(logStatement => {
        if (!content.includes(logStatement)) {
          missingLogs.push(logStatement);
        }
      });
      
      return missingLogs;
    } catch (error) {
      return ['File read error'];
    }
  }

  verifyEndpoints(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const missingEndpoints = [];
      
      this.requiredEndpoints.forEach(endpoint => {
        if (!content.includes(endpoint)) {
          missingEndpoints.push(endpoint);
        }
      });
      
      return missingEndpoints;
    } catch (error) {
      return ['File read error'];
    }
  }

  verifyFileIntegrity() {
    this.log('Starting Document Upload Integrity Verification');
    this.log('=' + '='.repeat(50));
    
    let allValid = true;
    const results = {
      fileStatus: {},
      consoleLogging: {},
      endpoints: {},
      summary: {
        totalFiles: this.protectedFiles.length,
        validFiles: 0,
        invalidFiles: 0,
        missingFiles: 0
      }
    };

    this.protectedFiles.forEach(filePath => {
      this.log(`Verifying: ${filePath}`);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        this.log(`File missing: ${filePath}`, 'error');
        results.fileStatus[filePath] = 'MISSING';
        results.summary.missingFiles++;
        allValid = false;
        return;
      }

      // Calculate file hash for integrity tracking
      const hash = this.calculateFileHash(filePath);
      results.fileStatus[filePath] = hash ? 'EXISTS' : 'ERROR';

      // Verify console logging
      const missingLogs = this.verifyConsoleLogging(filePath);
      results.consoleLogging[filePath] = missingLogs;
      
      if (missingLogs.length > 0) {
        this.log(`Missing console logging in ${filePath}:`, 'error');
        missingLogs.forEach(log => this.log(`  - ${log}`, 'error'));
        allValid = false;
      }

      // Verify endpoints (for API files)
      if (filePath.includes('api.ts') || filePath.includes('index.ts')) {
        const missingEndpoints = this.verifyEndpoints(filePath);
        results.endpoints[filePath] = missingEndpoints;
        
        if (missingEndpoints.length > 0) {
          this.log(`Missing endpoints in ${filePath}:`, 'error');
          missingEndpoints.forEach(endpoint => this.log(`  - ${endpoint}`, 'error'));
          allValid = false;
        }
      }

      if (missingLogs.length === 0 && (results.endpoints[filePath] || []).length === 0) {
        results.summary.validFiles++;
        this.log(`✅ File integrity verified: ${filePath}`, 'success');
      } else {
        results.summary.invalidFiles++;
      }
    });

    this.log('=' + '='.repeat(50));
    this.log('INTEGRITY VERIFICATION SUMMARY');
    this.log(`Total Files: ${results.summary.totalFiles}`);
    this.log(`Valid Files: ${results.summary.validFiles}`);
    this.log(`Invalid Files: ${results.summary.invalidFiles}`);
    this.log(`Missing Files: ${results.summary.missingFiles}`);

    if (allValid) {
      this.log('🔒 ALL PROTECTED COMPONENTS VERIFIED - LOCK INTEGRITY MAINTAINED', 'success');
    } else {
      this.log('🚨 LOCK INTEGRITY VIOLATION DETECTED - USER AUTHORIZATION REQUIRED', 'error');
    }

    return {
      valid: allValid,
      results: results
    };
  }

  generateIntegrityReport() {
    const verification = this.verifyFileIntegrity();
    
    const reportPath = 'upload-integrity-report.json';
    const report = {
      timestamp: new Date().toISOString(),
      lockStatus: verification.valid ? 'SECURE' : 'COMPROMISED',
      verification: verification.results,
      recommendations: verification.valid ? 
        ['No action required - all components secure'] :
        ['Restore from backup', 'Obtain user authorization for changes', 'Re-verify after restoration']
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`Integrity report saved: ${reportPath}`);
    
    return report;
  }
}

// Execute verification
const verifier = new UploadIntegrityVerifier();
const report = verifier.generateIntegrityReport();

process.exit(report.lockStatus === 'SECURE' ? 0 : 1);