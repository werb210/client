/**
 * Production Monitoring Script
 * Implements T+30min, T+24h, and weekly monitoring schedule
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  API_BASE: process.env.VITE_API_BASE_URL || 'https://app.boreal.financial/api',
  UPLOAD_DIR: process.env.UPLOAD_DIRECTORY || './uploads',
  TOKEN: process.env.CLIENT_APP_SHARED_TOKEN,
  LOG_FILE: './monitoring.log'
};

// Logging utility
function log(level, message) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} [${level}] ${message}`;
  console.log(logEntry);
  
  try {
    fs.appendFileSync(CONFIG.LOG_FILE, logEntry + '\n');
  } catch (error) {
    console.error('Failed to write log:', error.message);
  }
}

// T+30min: Check for first real application
async function checkFirstApplication() {
  log('INFO', 'Starting T+30min first application check...');
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Query recent applications
    const response = await fetch(`${CONFIG.API_BASE}/applications/recent?limit=10`, {
      headers: {
        'Authorization': `Bearer ${CONFIG.TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      log('ERROR', `API call failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    const applications = data.applications || [];
    
    // Check for real applications (not test data)
    const realApps = applications.filter(app => {
      return app.id.startsWith('app_prod_') && 
             !app.email?.includes('test') &&
             !app.businessName?.toLowerCase().includes('test');
    });
    
    if (realApps.length === 0) {
      log('WARNING', 'No real applications found yet (only test data)');
      return false;
    }
    
    log('SUCCESS', `Found ${realApps.length} real application(s)`);
    
    // Check SignNow integration for first real application
    const firstApp = realApps[0];
    const signingResponse = await fetch(`${CONFIG.API_BASE}/applications/${firstApp.id}/signing-status`, {
      headers: {
        'Authorization': `Bearer ${CONFIG.TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (signingResponse.ok) {
      const signingData = await signingResponse.json();
      if (signingData.signingUrl) {
        log('SUCCESS', `SignNow link served for application ${firstApp.id}`);
        return true;
      } else {
        log('WARNING', `SignNow link not yet generated for ${firstApp.id}`);
        return false;
      }
    } else {
      log('ERROR', `Failed to check SignNow status: ${signingResponse.status}`);
      return false;
    }
    
  } catch (error) {
    log('ERROR', `First application check failed: ${error.message}`);
    return false;
  }
}

// T+24h: Audit document upload directory
async function auditDocumentUploads() {
  log('INFO', 'Starting T+24h document upload audit...');
  
  try {
    if (!fs.existsSync(CONFIG.UPLOAD_DIR)) {
      log('WARNING', `Upload directory ${CONFIG.UPLOAD_DIR} does not exist`);
      return false;
    }
    
    const files = fs.readdirSync(CONFIG.UPLOAD_DIR, { withFileTypes: true });
    const documentFiles = files.filter(file => file.isFile());
    
    let totalSize = 0;
    let orphanedFiles = [];
    let oldFiles = [];
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // Analyze each file
    for (const file of documentFiles) {
      const filePath = path.join(CONFIG.UPLOAD_DIR, file.name);
      const stats = fs.statSync(filePath);
      
      totalSize += stats.size;
      
      // Check if file is older than 7 days
      if (stats.mtime.getTime() < oneWeekAgo) {
        oldFiles.push({
          name: file.name,
          size: stats.size,
          age: Math.floor((Date.now() - stats.mtime.getTime()) / (24 * 60 * 60 * 1000))
        });
      }
      
      // Check if file is orphaned (no associated application)
      const applicationId = file.name.split('_')[0];
      if (applicationId && applicationId.startsWith('app_')) {
        try {
          const fetch = (await import('node-fetch')).default;
          const response = await fetch(`${CONFIG.API_BASE}/applications/${applicationId}`, {
            headers: {
              'Authorization': `Bearer ${CONFIG.TOKEN}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok && response.status === 404) {
            orphanedFiles.push({
              name: file.name,
              size: stats.size,
              applicationId
            });
          }
        } catch (error) {
          log('WARNING', `Could not verify application ${applicationId}: ${error.message}`);
        }
      }
    }
    
    // Report findings
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    log('INFO', `Document audit complete: ${documentFiles.length} files, ${totalSizeMB} MB total`);
    log('INFO', `Orphaned files: ${orphanedFiles.length}`);
    log('INFO', `Old files (>7 days): ${oldFiles.length}`);
    
    // Storage health assessment
    if (totalSize > 1024 * 1024 * 1024) { // >1GB
      log('CRITICAL', 'Storage exceeds 1GB - implement cleanup');
    } else if (totalSize > 500 * 1024 * 1024) { // >500MB
      log('WARNING', 'Storage exceeds 500MB - monitor closely');
    }
    
    if (orphanedFiles.length > 100) {
      log('CRITICAL', `${orphanedFiles.length} orphaned files - cleanup required`);
    } else if (orphanedFiles.length > 50) {
      log('WARNING', `${orphanedFiles.length} orphaned files - review for cleanup`);
    }
    
    // Log cleanup recommendations
    if (oldFiles.length > 0) {
      log('INFO', `Cleanup recommendation: Archive ${oldFiles.length} files older than 7 days`);
    }
    
    return {
      totalFiles: documentFiles.length,
      totalSizeMB: parseFloat(totalSizeMB),
      orphanedFiles: orphanedFiles.length,
      oldFiles: oldFiles.length
    };
    
  } catch (error) {
    log('ERROR', `Document audit failed: ${error.message}`);
    return false;
  }
}

// Weekly: Rotate CLIENT_APP_SHARED_TOKEN
async function rotateClientToken() {
  log('INFO', 'Starting weekly CLIENT_APP_SHARED_TOKEN rotation...');
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Request new token with grace period
    const response = await fetch(`${CONFIG.API_BASE}/auth/rotate-client-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gracePeriodMinutes: 60 // 1 hour overlap
      })
    });
    
    if (!response.ok) {
      log('ERROR', `Token rotation request failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    const newToken = data.newToken;
    const gracePeriodExpiry = data.gracePeriodExpiry;
    
    if (!newToken) {
      log('ERROR', 'No new token received from rotation endpoint');
      return false;
    }
    
    log('SUCCESS', `New token generated, grace period until ${gracePeriodExpiry}`);
    
    // Test new token functionality
    const testResponse = await fetch(`${CONFIG.API_BASE}/health`, {
      headers: {
        'Authorization': `Bearer ${newToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!testResponse.ok) {
      log('ERROR', 'New token failed health check');
      return false;
    }
    
    log('SUCCESS', 'New token verified working');
    
    // Update environment variables (manual step for production)
    log('ACTION_REQUIRED', `Update CLIENT_APP_SHARED_TOKEN to: ${newToken}`);
    log('ACTION_REQUIRED', `Grace period expires: ${gracePeriodExpiry}`);
    
    // Monitor client pickup (would be automated in production)
    setTimeout(async () => {
      log('INFO', 'Monitoring client token pickup...');
      
      // Check if client applications are using new token
      const monitorResponse = await fetch(`${CONFIG.API_BASE}/applications/recent?limit=1`, {
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (monitorResponse.ok) {
        log('SUCCESS', 'Client successfully picked up new token');
      } else {
        log('WARNING', 'Client may not have picked up new token yet');
      }
    }, 30000); // Check after 30 seconds
    
    return {
      newToken,
      gracePeriodExpiry,
      oldTokenExpiry: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    };
    
  } catch (error) {
    log('ERROR', `Token rotation failed: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  const action = process.argv[2];
  
  if (!action) {
    console.log('Usage: node scripts/production-monitoring.js <action>');
    console.log('Actions: T+30min, T+24h, weekly');
    process.exit(1);
  }
  
  log('INFO', `Starting ${action} monitoring check`);
  
  let result;
  switch (action) {
    case 'T+30min':
      result = await checkFirstApplication();
      break;
    case 'T+24h':
      result = await auditDocumentUploads();
      break;
    case 'weekly':
      result = await rotateClientToken();
      break;
    default:
      log('ERROR', `Unknown action: ${action}`);
      process.exit(1);
  }
  
  if (result) {
    log('SUCCESS', `${action} monitoring completed successfully`);
    process.exit(0);
  } else {
    log('ERROR', `${action} monitoring failed`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('INFO', 'Monitoring script interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('INFO', 'Monitoring script terminated');
  process.exit(0);
});

// Run main function
main().catch(error => {
  log('FATAL', `Unhandled error: ${error.message}`);
  process.exit(1);
});