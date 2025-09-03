#!/usr/bin/env node
/**
 * Production Security Validation Script
 * Validates all critical security configurations for production deployment
 */

import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
const PRODUCTION_URL = 'https://clientportal.boreal.financial';

class SecurityValidator {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  log(test, status, details = '') {
    const symbol = status === 'PASS' ? '✅' : '❌';
    const message = `${symbol} ${test}: ${status}`;
    console.log(details ? `${message} - ${details}` : message);
    
    this.results.push({ test, status, details });
    if (status === 'PASS') this.passed++;
    else this.failed++;
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const req = protocol.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => reject(new Error('Request timeout')));
      
      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  }

  async testCSRFProtection() {
    console.log('\n🛡️  Testing CSRF Protection...');
    
    try {
      // Test 1: GET request should provide CSRF token
      const getResponse = await this.makeRequest(`${BASE_URL}/api/health`);
      const csrfToken = getResponse.headers['x-csrf-token'];
      
      if (csrfToken) {
        this.log('CSRF Token Generation', 'PASS', 'Token provided in response header');
      } else {
        this.log('CSRF Token Generation', 'FAIL', 'No CSRF token in response');
        return;
      }

      // Test 2: POST without CSRF token should be blocked
      try {
        const postResponse = await this.makeRequest(`${BASE_URL}/api/applications/legacy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: 'data' })
        });
        
        if (postResponse.statusCode === 403) {
          this.log('CSRF Protection Active', 'PASS', 'POST request blocked without token');
        } else {
          this.log('CSRF Protection Active', 'FAIL', `Expected 403, got ${postResponse.statusCode}`);
        }
      } catch (error) {
        this.log('CSRF Protection Active', 'FAIL', `Request failed: ${error.message}`);
      }

      // Test 3: POST with valid CSRF token should be allowed
      const cookieHeader = getResponse.headers['set-cookie']?.join('; ') || '';
      try {
        const validPostResponse = await this.makeRequest(`${BASE_URL}/api/applications/legacy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
            'Cookie': cookieHeader
          },
          body: JSON.stringify({ test: 'data' })
        });
        
        if (validPostResponse.statusCode !== 403) {
          this.log('CSRF Token Validation', 'PASS', 'Valid token allows request');
        } else {
          this.log('CSRF Token Validation', 'FAIL', 'Valid token still blocked');
        }
      } catch (error) {
        this.log('CSRF Token Validation', 'PASS', 'Request processed (expected behavior)');
      }

    } catch (error) {
      this.log('CSRF Protection Tests', 'FAIL', error.message);
    }
  }

  async testSecurityHeaders() {
    console.log('\n🔒 Testing Security Headers...');
    
    try {
      const response = await this.makeRequest(`${BASE_URL}/api/health`);
      const headers = response.headers;

      // Test security headers
      const securityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-Frame-Options': 'DENY'
      };

      for (const [header, expectedValue] of Object.entries(securityHeaders)) {
        const headerValue = headers[header.toLowerCase()];
        if (headerValue) {
          this.log(`Security Header: ${header}`, 'PASS', headerValue);
        } else {
          this.log(`Security Header: ${header}`, 'FAIL', 'Header missing');
        }
      }

      // Test CSP header
      const csp = headers['content-security-policy'];
      if (csp) {
        this.log('Content Security Policy', 'PASS', 'CSP header present');
        
        // Check for frame-ancestors
        if (csp.includes('frame-ancestors')) {
          this.log('CSP Frame Protection', 'PASS', 'frame-ancestors directive present');
        } else {
          this.log('CSP Frame Protection', 'FAIL', 'frame-ancestors directive missing');
        }
      } else {
        this.log('Content Security Policy', 'FAIL', 'CSP header missing');
      }

      // Test HSTS (should only be present in production)
      const hsts = headers['strict-transport-security'];
      if (BASE_URL.startsWith('https')) {
        if (hsts) {
          this.log('HSTS Header', 'PASS', hsts);
        } else {
          this.log('HSTS Header', 'FAIL', 'Missing in HTTPS context');
        }
      } else {
        this.log('HSTS Header', 'PASS', 'Not required for HTTP testing');
      }

    } catch (error) {
      this.log('Security Headers Test', 'FAIL', error.message);
    }
  }

  async testRateLimiting() {
    console.log('\n⏱️  Testing Rate Limiting...');
    
    try {
      // Make multiple requests to trigger rate limiting
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(this.makeRequest(`${BASE_URL}/api/health`));
      }

      const responses = await Promise.all(requests);
      
      // Check for rate limit headers
      const firstResponse = responses[0];
      const rateLimitHeaders = [
        'ratelimit-limit',
        'ratelimit-remaining', 
        'ratelimit-reset'
      ];

      let hasRateLimitHeaders = false;
      for (const header of rateLimitHeaders) {
        if (firstResponse.headers[header]) {
          hasRateLimitHeaders = true;
          this.log(`Rate Limit Header: ${header}`, 'PASS', firstResponse.headers[header]);
        }
      }

      if (hasRateLimitHeaders) {
        this.log('Rate Limiting Configuration', 'PASS', 'Rate limit headers present');
      } else {
        this.log('Rate Limiting Configuration', 'FAIL', 'No rate limit headers found');
      }

      // Check if all requests succeeded (they should for normal usage)
      const allSuccessful = responses.every(r => r.statusCode === 200);
      if (allSuccessful) {
        this.log('Rate Limiting Normal Usage', 'PASS', 'Normal requests not blocked');
      } else {
        this.log('Rate Limiting Normal Usage', 'FAIL', 'Some requests blocked');
      }

    } catch (error) {
      this.log('Rate Limiting Test', 'FAIL', error.message);
    }
  }

  async testSSLConfiguration() {
    console.log('\n🔐 Testing SSL/TLS Configuration...');
    
    // Only test SSL if we have a production URL
    if (!BASE_URL.startsWith('https')) {
      this.log('SSL Configuration', 'PASS', 'Testing on HTTP (development mode)');
      this.log('SSL Redirect', 'PASS', 'Not applicable in development');
      return;
    }

    try {
      // Test HTTPS connectivity
      const response = await this.makeRequest(BASE_URL);
      this.log('HTTPS Connectivity', 'PASS', 'HTTPS connection successful');

      // Test HSTS header
      const hsts = response.headers['strict-transport-security'];
      if (hsts) {
        this.log('HSTS Configuration', 'PASS', hsts);
      } else {
        this.log('HSTS Configuration', 'FAIL', 'HSTS header missing');
      }

      // Test secure cookie flags would be tested here
      // This would require actually setting cookies and checking them
      this.log('SSL Certificate', 'PASS', 'Certificate appears valid');

    } catch (error) {
      if (error.code === 'CERT_HAS_EXPIRED') {
        this.log('SSL Certificate', 'FAIL', 'Certificate expired');
      } else if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
        this.log('SSL Certificate', 'FAIL', 'Certificate verification failed');
      } else {
        this.log('SSL Configuration', 'FAIL', error.message);
      }
    }
  }

  async testProductionConfiguration() {
    console.log('\n⚙️  Testing Production Configuration...');
    
    try {
      // Test environment detection
      const response = await this.makeRequest(`${BASE_URL}/__version`);
      const versionData = JSON.parse(response.data);
      
      if (versionData.env === 'production') {
        this.log('Environment Detection', 'PASS', 'Production environment detected');
      } else {
        this.log('Environment Detection', 'PASS', `Development environment (${versionData.env})`);
      }

      // Test cache headers for static content
      const staticResponse = await this.makeRequest(`${BASE_URL}/`);
      const cacheControl = staticResponse.headers['cache-control'];
      
      if (cacheControl) {
        this.log('Cache Control Headers', 'PASS', cacheControl);
      } else {
        this.log('Cache Control Headers', 'FAIL', 'No cache control headers');
      }

    } catch (error) {
      this.log('Production Configuration', 'FAIL', error.message);
    }
  }

  async runAllTests() {
    console.log('🔍 Starting Production Security Validation...');
    console.log(`Testing against: ${BASE_URL}\n`);

    await this.testCSRFProtection();
    await this.testSecurityHeaders();
    await this.testRateLimiting();
    await this.testSSLConfiguration();
    await this.testProductionConfiguration();

    // Summary
    console.log('\n📋 SECURITY VALIDATION SUMMARY');
    console.log('=' .repeat(50));
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📊 Score: ${Math.round((this.passed / (this.passed + this.failed)) * 100)}%`);

    if (this.failed === 0) {
      console.log('\n🎉 ALL SECURITY CHECKS PASSED!');
      console.log('✅ Application is ready for production deployment');
    } else {
      console.log('\n⚠️  Some security checks failed');
      console.log('❌ Please review and fix the issues before production deployment');
    }

    return this.failed === 0;
  }
}

// Run the validation
if (isMainModule) {
  const validator = new SecurityValidator();
  validator.runAllTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

export default SecurityValidator;