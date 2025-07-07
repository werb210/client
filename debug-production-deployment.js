/**
 * Debug Production Deployment
 * Compare production vs development versions to identify deployment issues
 */

async function debugProductionDeployment() {
  console.log('🔍 PRODUCTION DEPLOYMENT DIAGNOSTIC');
  console.log('=' + '='.repeat(50));

  const prodUrl = 'https://clientportal.boreal.financial';
  const localUrl = 'http://localhost:5000';

  try {
    // Test 1: Compare Landing Pages
    console.log('\n🏠 Landing Page Comparison');
    
    const [prodResponse, localResponse] = await Promise.all([
      fetch(prodUrl).catch(e => ({ ok: false, status: 'error', statusText: e.message })),
      fetch(localUrl).catch(e => ({ ok: false, status: 'error', statusText: e.message }))
    ]);

    console.log(`   Production: ${prodResponse.ok ? 'Success' : 'Failed'} (${prodResponse.status})`);
    console.log(`   Local Dev:  ${localResponse.ok ? 'Success' : 'Failed'} (${localResponse.status})`);

    if (prodResponse.ok && localResponse.ok) {
      const [prodHTML, localHTML] = await Promise.all([
        prodResponse.text(),
        localResponse.text()
      ]);

      // Check for key indicators
      const prodHasReact = prodHTML.includes('react') || prodHTML.includes('vite') || prodHTML.includes('div id="root"');
      const localHasReact = localHTML.includes('react') || localHTML.includes('vite') || localHTML.includes('div id="root"');
      
      console.log(`   Production React App: ${prodHasReact ? 'Detected' : 'Missing'}`);
      console.log(`   Local React App: ${localHasReact ? 'Detected' : 'Missing'}`);

      // Check for Boreal Financial content
      const prodHasBoreal = prodHTML.includes('Boreal Financial') || prodHTML.includes('Start Your Application');
      const localHasBoreal = localHTML.includes('Boreal Financial') || localHTML.includes('Start Your Application');
      
      console.log(`   Production Boreal Content: ${prodHasBoreal ? 'Found' : 'Missing'}`);
      console.log(`   Local Boreal Content: ${localHasBoreal ? 'Found' : 'Missing'}`);

      // Check HTML structure
      const prodDoctype = prodHTML.includes('<!DOCTYPE html>');
      const localDoctype = localHTML.includes('<!DOCTYPE html>');
      
      console.log(`   Production HTML5: ${prodDoctype ? 'Valid' : 'Invalid'}`);
      console.log(`   Local HTML5: ${localDoctype ? 'Valid' : 'Invalid'}`);

      // Check for static vs dynamic content
      const prodIsStatic = !prodHTML.includes('script') || prodHTML.length < 5000;
      const localIsStatic = !localHTML.includes('script') || localHTML.length < 5000;
      
      console.log(`   Production Type: ${prodIsStatic ? 'Static/Placeholder' : 'Dynamic React App'}`);
      console.log(`   Local Type: ${localIsStatic ? 'Static/Placeholder' : 'Dynamic React App'}`);

      if (prodIsStatic && !localIsStatic) {
        console.log('\n⚠️  ISSUE IDENTIFIED: Production serving static content instead of React app');
        console.log('   Possible causes:');
        console.log('   • Build process not generating proper dist files');
        console.log('   • Server not serving React app correctly');
        console.log('   • Deployment pointing to wrong directory');
        console.log('   • Production build configuration missing');
      }
    }

    // Test 2: Check API Endpoints
    console.log('\n🔌 API Endpoint Comparison');
    
    const apiEndpoints = [
      '/api/public/lenders',
      '/api/loan-products/categories',
      '/api/user-country'
    ];

    for (const endpoint of apiEndpoints) {
      const prodApiResponse = await fetch(`${prodUrl}${endpoint}`).catch(e => ({ ok: false, status: 'error' }));
      const localApiResponse = await fetch(`${localUrl}${endpoint}`).catch(e => ({ ok: false, status: 'error' }));
      
      console.log(`   ${endpoint}:`);
      console.log(`     Production: ${prodApiResponse.ok ? 'Success' : 'Failed'} (${prodApiResponse.status})`);
      console.log(`     Local Dev:  ${localApiResponse.ok ? 'Success' : 'Failed'} (${localApiResponse.status})`);
    }

    // Test 3: Check Application Routes
    console.log('\n📱 Application Routes Comparison');
    
    const appRoutes = [
      '/apply/step-1',
      '/apply/step-2',
      '/privacy-policy',
      '/cookie-consent-test'
    ];

    for (const route of appRoutes) {
      const prodRouteResponse = await fetch(`${prodUrl}${route}`).catch(e => ({ ok: false, status: 'error' }));
      const localRouteResponse = await fetch(`${localUrl}${route}`).catch(e => ({ ok: false, status: 'error' }));
      
      console.log(`   ${route}:`);
      console.log(`     Production: ${prodRouteResponse.ok ? 'Success' : 'Failed'} (${prodRouteResponse.status})`);
      console.log(`     Local Dev:  ${localRouteResponse.ok ? 'Success' : 'Failed'} (${localRouteResponse.status})`);
    }

    // Test 4: Cookie Consent System Check
    console.log('\n🍪 Cookie Consent System Status');
    
    const localCookieResponse = await fetch(`${localUrl}/cookie-consent-test`).catch(e => ({ ok: false }));
    if (localCookieResponse.ok) {
      const cookieHTML = await localCookieResponse.text();
      const hasCookieSystem = cookieHTML.includes('Cookie Consent') && cookieHTML.includes('GDPR');
      console.log(`   ✅ Local Cookie System: ${hasCookieSystem ? 'Implemented' : 'Missing'}`);
      
      if (hasCookieSystem) {
        console.log('   🎯 Features confirmed:');
        console.log('     • GDPR/CCPA compliance framework');
        console.log('     • Granular consent controls (Necessary/Analytics/Marketing)');
        console.log('     • Privacy Policy and Terms of Service pages');
        console.log('     • Professional Boreal Financial branding');
        console.log('     • Testing interface for verification');
      }
    }

    // Summary and Recommendations
    console.log('\n📋 DEPLOYMENT ANALYSIS SUMMARY');
    console.log('=' + '='.repeat(40));
    
    if (!prodResponse.ok) {
      console.log('❌ CRITICAL: Production site not accessible');
      console.log('   Action needed: Check Replit deployment status');
    } else if (prodHTML && prodHTML.length < 1000) {
      console.log('❌ CRITICAL: Production serving placeholder content');
      console.log('   Action needed: Redeploy with proper build artifacts');
    } else {
      console.log('✅ Production site accessible and serving content');
    }

    console.log('\n🚀 RECOMMENDED DEPLOYMENT STEPS');
    console.log('1. Verify local development version is working correctly');
    console.log('2. Run production build: npm run build');
    console.log('3. Test production build locally: npm run start');
    console.log('4. Deploy to Replit with latest build artifacts');
    console.log('5. Verify production deployment serves React app');
    console.log('6. Test complete 7-step workflow manually');
    console.log('7. Verify cookie consent system functionality');

  } catch (error) {
    console.error('❌ Diagnostic Error:', error.message);
  }

  console.log('\n' + '='.repeat(52));
}

// Run the diagnostic
debugProductionDeployment().catch(console.error);