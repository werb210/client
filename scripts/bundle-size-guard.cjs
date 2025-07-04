/**
 * Bundle Size Guard
 * Prevents bundle size regressions after dependency cleanup
 */

const fs = require('fs');
const path = require('path');
const { gzipSync } = require('zlib');

class BundleSizeGuard {
  constructor() {
    this.maxSizeBytes = 2.7 * 1024 * 1024; // 2.7 MB gzipped
    this.distPath = path.join(__dirname, '../dist/assets');
  }

  async checkBundleSize() {
    if (!fs.existsSync(this.distPath)) {
      throw new Error('❌ Build artifacts not found. Run `npm run build` first.');
    }

    const files = fs.readdirSync(this.distPath);
    const jsFiles = files.filter(file => file.startsWith('index-') && file.endsWith('.js'));

    if (jsFiles.length === 0) {
      throw new Error('❌ No index-*.js bundle files found in dist/assets');
    }

    const results = [];
    let totalGzippedSize = 0;

    for (const file of jsFiles) {
      const filePath = path.join(this.distPath, file);
      const content = fs.readFileSync(filePath);
      const gzippedContent = gzipSync(content);
      const sizeKB = (gzippedContent.length / 1024).toFixed(2);
      const sizeMB = (gzippedContent.length / (1024 * 1024)).toFixed(2);

      results.push({
        file,
        originalSize: content.length,
        gzippedSize: gzippedContent.length,
        sizeKB,
        sizeMB
      });

      totalGzippedSize += gzippedContent.length;
    }

    const maxSizeMB = (this.maxSizeBytes / (1024 * 1024)).toFixed(1);
    const totalSizeMB = (totalGzippedSize / (1024 * 1024)).toFixed(2);

    console.log('📦 Bundle Size Analysis:');
    console.log('========================');
    
    results.forEach(result => {
      console.log(`📄 ${result.file}: ${result.sizeKB} KB (${result.sizeMB} MB) gzipped`);
    });

    console.log('------------------------');
    console.log(`📊 Total gzipped size: ${totalSizeMB} MB`);
    console.log(`🎯 Maximum allowed: ${maxSizeMB} MB`);

    if (totalGzippedSize > this.maxSizeBytes) {
      const overage = ((totalGzippedSize - this.maxSizeBytes) / (1024 * 1024)).toFixed(2);
      console.log(`❌ BUNDLE SIZE EXCEEDED by ${overage} MB!`);
      console.log('');
      console.log('🔧 Recommendations:');
      console.log('   • Check for unused dependencies');
      console.log('   • Use dynamic imports for large features');
      console.log('   • Review and optimize large libraries');
      console.log('   • Consider code splitting strategies');
      
      return {
        success: false,
        totalSize: totalGzippedSize,
        maxSize: this.maxSizeBytes,
        overage: totalGzippedSize - this.maxSizeBytes,
        files: results
      };
    }

    console.log('✅ Bundle size within limits!');
    const remaining = ((this.maxSizeBytes - totalGzippedSize) / (1024 * 1024)).toFixed(2);
    console.log(`📈 Remaining budget: ${remaining} MB`);

    return {
      success: true,
      totalSize: totalGzippedSize,
      maxSize: this.maxSizeBytes,
      remaining: this.maxSizeBytes - totalGzippedSize,
      files: results
    };
  }

  generateSizeReport() {
    return this.checkBundleSize().then(result => {
      const report = {
        timestamp: new Date().toISOString(),
        success: result.success,
        totalSizeMB: (result.totalSize / (1024 * 1024)).toFixed(2),
        maxSizeMB: (result.maxSize / (1024 * 1024)).toFixed(1),
        files: result.files.map(f => ({
          name: f.file,
          sizeMB: f.sizeMB
        }))
      };

      const reportPath = path.join(__dirname, '../logs/bundle-size-report.json');
      const logsDir = path.dirname(reportPath);
      
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`📝 Report saved to: ${reportPath}`);

      return result;
    });
  }
}

// Command line usage
if (require.main === module) {
  const guard = new BundleSizeGuard();
  
  const command = process.argv[2];

  switch (command) {
    case 'check':
      guard.checkBundleSize()
        .then(result => {
          process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
          console.error('❌ Bundle size check failed:', error.message);
          process.exit(1);
        });
      break;

    case 'report':
      guard.generateSizeReport()
        .then(() => {
          console.log('✅ Bundle size report generated');
        })
        .catch(error => {
          console.error('❌ Report generation failed:', error.message);
          process.exit(1);
        });
      break;

    default:
      console.log('Usage:');
      console.log('  node bundle-size-guard.js check   # Check bundle size and exit with code');
      console.log('  node bundle-size-guard.js report  # Generate detailed report');
  }
}

module.exports = BundleSizeGuard;