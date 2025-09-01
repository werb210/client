/**
 * Test suite for all the improvements implemented
 */

import { describe, test, expect } from 'vitest';
import { runAccessibilityAudit } from '../client/src/utils/accessibility';
import { runSecurityAudit } from '../client/src/utils/securityValidation';
import { testPWAFunctionality } from '../client/src/utils/pwaTestSuite';
import { validationSchemas } from '../client/src/utils/formValidationEnhanced';
import { getConnectionInfo, getLoadingStrategy } from '../client/src/utils/loadingStates';

describe('Application Improvements', () => {
  test('accessibility audit should identify issues', async () => {
    // Mock DOM elements for testing
    document.body.innerHTML = `
      <img src="test.jpg" />
      <button>Click me</button>
      <input type="email" />
    `;

    const result = await runAccessibilityAudit();
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('issues');
    expect(result.issues.length).toBeGreaterThan(0);
  });

  test('security validation should check for vulnerabilities', async () => {
    const result = await runSecurityAudit();
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('vulnerabilities');
    expect(result).toHaveProperty('compliance');
  });

  test('form validation should provide helpful error messages', () => {
    const emailResult = validationSchemas.email.safeParse('invalid-email');
    expect(emailResult.success).toBe(false);
    if (!emailResult.success) {
      expect(emailResult.error.errors[0].message).toContain('valid email address');
    }

    const phoneResult = validationSchemas.phone.safeParse('123');
    expect(phoneResult.success).toBe(false);
    if (!phoneResult.success) {
      expect(phoneResult.error.errors[0].message).toContain('valid phone number');
    }
  });

  test('loading strategy should adapt to connection speed', () => {
    const slowConnection = {
      effectiveType: '2g',
      downlink: 0.5,
      rtt: 300,
      saveData: true
    };

    const strategy = getLoadingStrategy(slowConnection);
    expect(strategy.preloadImages).toBe(false);
    expect(strategy.optimizeImages).toBe(true);
    expect(strategy.useSkeletons).toBe(true);
  });

  test('connection info should be detectable', () => {
    const connectionInfo = getConnectionInfo();
    expect(connectionInfo).toHaveProperty('effectiveType');
    expect(connectionInfo).toHaveProperty('downlink');
    expect(connectionInfo).toHaveProperty('rtt');
    expect(connectionInfo).toHaveProperty('saveData');
  });
});