/**
 * API integration testing with staff backend
 */

export interface APITestResult {
  endpoint: string;
  status: 'pass' | 'fail' | 'warning';
  responseTime: number;
  statusCode: number;
  error?: string;
  data?: any;
}

export interface APITestSuite {
  results: APITestResult[];
  overallScore: number;
  totalTests: number;
  passed: number;
  failed: number;
}

/**
 * Test suite for all critical API endpoints
 */
export async function runAPIIntegrationTests(): Promise<APITestSuite> {
  const testEndpoints = [
    { url: '/api/lender-products', method: 'GET', critical: true },
    { url: '/api/catalog/products', method: 'GET', critical: true },
    { url: '/api/document-requirements', method: 'GET', critical: true },
    { url: '/api/lenders', method: 'GET', critical: false },
    { url: '/api/health', method: 'GET', critical: true },
    { url: '/api/int/state', method: 'GET', critical: false }
  ];

  const results: APITestResult[] = [];
  
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint.url, endpoint.method);
    results.push(result);
  }

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const overallScore = Math.round((passed / results.length) * 100);

  return {
    results,
    overallScore,
    totalTests: results.length,
    passed,
    failed
  };
}

async function testEndpoint(url: string, method: string = 'GET'): Promise<APITestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const responseTime = Date.now() - startTime;
    const data = response.headers.get('content-type')?.includes('application/json') 
      ? await response.json() 
      : await response.text();

    return {
      endpoint: url,
      status: response.ok ? 'pass' : 'fail',
      responseTime,
      statusCode: response.status,
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
    };
  } catch (error) {
    return {
      endpoint: url,
      status: 'fail',
      responseTime: Date.now() - startTime,
      statusCode: 0,
      error: (error as Error).message
    };
  }
}

/**
 * Test form submission flow
 */
export async function testFormSubmissionFlow(formData: any): Promise<APITestResult> {
  const startTime = Date.now();
  
  try {
    // Test application submission
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    return {
      endpoint: '/api/applications',
      status: response.ok ? 'pass' : 'fail',
      responseTime,
      statusCode: response.status,
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data.error || 'Submission failed'
    };
  } catch (error) {
    return {
      endpoint: '/api/applications',
      status: 'fail',
      responseTime: Date.now() - startTime,
      statusCode: 0,
      error: (error as Error).message
    };
  }
}

/**
 * Test file upload functionality
 */
export async function testFileUpload(file: File): Promise<APITestResult> {
  const startTime = Date.now();
  
  try {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', 'bank_statement');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    return {
      endpoint: '/api/upload',
      status: response.ok ? 'pass' : 'fail',
      responseTime,
      statusCode: response.status,
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data.error || 'Upload failed'
    };
  } catch (error) {
    return {
      endpoint: '/api/upload',
      status: 'fail',
      responseTime: Date.now() - startTime,
      statusCode: 0,
      error: (error as Error).message
    };
  }
}

/**
 * Monitor API performance over time
 */
export class APIPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  recordResponseTime(endpoint: string, responseTime: number): void {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }
    
    const times = this.metrics.get(endpoint)!;
    times.push(responseTime);
    
    // Keep only last 50 measurements
    if (times.length > 50) {
      times.shift();
    }
  }

  getAverageResponseTime(endpoint: string): number {
    const times = this.metrics.get(endpoint) || [];
    if (times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getSlowEndpoints(threshold: number = 2000): string[] {
    const slowEndpoints: string[] = [];
    
    for (const [endpoint, times] of this.metrics.entries()) {
      const avgTime = this.getAverageResponseTime(endpoint);
      if (avgTime > threshold) {
        slowEndpoints.push(endpoint);
      }
    }
    
    return slowEndpoints;
  }

  generateReport(): {endpoint: string; avgTime: number; requestCount: number}[] {
    const report: {endpoint: string; avgTime: number; requestCount: number}[] = [];
    
    for (const [endpoint, times] of this.metrics.entries()) {
      report.push({
        endpoint,
        avgTime: this.getAverageResponseTime(endpoint),
        requestCount: times.length
      });
    }
    
    return report.sort((a, b) => b.avgTime - a.avgTime);
  }
}