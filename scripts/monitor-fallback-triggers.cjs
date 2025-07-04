/**
 * Fallback Trigger Monitoring Script
 * Monitors for fallback data usage and alerts when threshold exceeded
 */

const fs = require('fs');
const path = require('path');

class FallbackMonitor {
  constructor() {
    this.alertThreshold = 1; // Alert if fallback triggers more than once per hour
    this.logFile = path.join(__dirname, '../logs/fallback-triggers.log');
    this.lastAlertTime = 0;
  }

  logFallbackTrigger(reason, timestamp = new Date()) {
    const logEntry = {
      timestamp: timestamp.toISOString(),
      reason,
      type: 'FALLBACK_TRIGGER'
    };

    // Ensure logs directory exists
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Append to log file
    fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');

    // Check if alert needed
    this.checkAlertThreshold();
  }

  checkAlertThreshold() {
    if (!fs.existsSync(this.logFile)) return;

    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Read recent log entries
    const logContent = fs.readFileSync(this.logFile, 'utf8');
    const recentEntries = logContent
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line))
      .filter(entry => new Date(entry.timestamp).getTime() > oneHourAgo);

    if (recentEntries.length > this.alertThreshold) {
      this.triggerAlert(recentEntries);
    }
  }

  triggerAlert(recentEntries) {
    const now = Date.now();
    const oneHourSinceLastAlert = now - (60 * 60 * 1000);

    // Don't spam alerts
    if (this.lastAlertTime > oneHourSinceLastAlert) return;

    const alertMessage = {
      level: 'WARNING',
      message: `Staff API fallback triggered ${recentEntries.length} times in the last hour`,
      threshold: this.alertThreshold,
      actualCount: recentEntries.length,
      recentTriggers: recentEntries.slice(-5), // Last 5 triggers
      recommendation: 'Check staff API health and network connectivity'
    };

    console.error('[FALLBACK MONITOR] ALERT:', JSON.stringify(alertMessage, null, 2));
    
    // Log alert
    fs.appendFileSync(this.logFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      type: 'ALERT',
      ...alertMessage
    }) + '\n');

    this.lastAlertTime = now;
  }

  getRecentStats() {
    if (!fs.existsSync(this.logFile)) {
      return { total: 0, lastHour: 0, status: 'healthy' };
    }

    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    const logContent = fs.readFileSync(this.logFile, 'utf8');
    const allEntries = logContent
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line))
      .filter(entry => entry.type === 'FALLBACK_TRIGGER');

    const recentEntries = allEntries.filter(
      entry => new Date(entry.timestamp).getTime() > oneHourAgo
    );

    return {
      total: allEntries.length,
      lastHour: recentEntries.length,
      status: recentEntries.length > this.alertThreshold ? 'alert' : 'healthy'
    };
  }
}

// Export for use in application
module.exports = FallbackMonitor;

// Command line usage
if (require.main === module) {
  const monitor = new FallbackMonitor();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'trigger':
      const reason = process.argv[3] || 'Manual test trigger';
      monitor.logFallbackTrigger(reason);
      console.log('✅ Fallback trigger logged:', reason);
      break;
      
    case 'stats':
      const stats = monitor.getRecentStats();
      console.log('📊 Fallback Monitor Stats:', stats);
      break;
      
    case 'test':
      // Simulate multiple triggers to test alerting
      console.log('🧪 Testing alert system...');
      for (let i = 0; i < 3; i++) {
        monitor.logFallbackTrigger(`Test trigger ${i + 1}`);
      }
      break;
      
    default:
      console.log('Usage:');
      console.log('  node monitor-fallback-triggers.js trigger [reason]');
      console.log('  node monitor-fallback-triggers.js stats');
      console.log('  node monitor-fallback-triggers.js test');
  }
}