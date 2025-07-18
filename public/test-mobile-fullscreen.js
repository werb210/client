// Mobile Fullscreen Chatbot Test Script
// Run this in browser console to test mobile fullscreen functionality

console.log('🧪 Testing Mobile Fullscreen Chatbot Functionality');

function testMobileFullscreen() {
  console.log('\n📱 Mobile Fullscreen Test Suite');
  
  // Test 1: Check CSS media query detection
  const isMobile = window.matchMedia('(max-width: 600px)').matches;
  console.log(`📏 Current screen width: ${window.innerWidth}px`);
  console.log(`📱 Mobile detection (≤600px): ${isMobile}`);
  
  // Test 2: Check if chat widget exists
  const chatWidget = document.querySelector('.chat-widget');
  console.log(`🤖 Chat widget found: ${!!chatWidget}`);
  
  // Test 3: Check for fullscreen class when applicable
  if (chatWidget) {
    const hasFullscreenClass = chatWidget.classList.contains('fullscreen-mobile');
    console.log(`📱 Fullscreen class applied: ${hasFullscreenClass}`);
    
    // Check computed styles
    const styles = window.getComputedStyle(chatWidget);
    console.log(`📐 Widget position: ${styles.position}`);
    console.log(`📐 Widget width: ${styles.width}`);
    console.log(`📐 Widget height: ${styles.height}`);
    console.log(`📐 Widget z-index: ${styles.zIndex}`);
  }
  
  // Test 4: Check body scroll prevention
  const bodyHasFullscreenClass = document.body.classList.contains('chatbot-fullscreen');
  console.log(`🚫 Body scroll prevention active: ${bodyHasFullscreenClass}`);
  
  // Test 5: Simulate mobile viewport
  console.log('\n🔄 Simulating mobile viewport (400px width)...');
  
  // This won't actually change the viewport but we can manually trigger the logic
  if (window.ChatBotComponent && window.ChatBotComponent.checkMobileFullscreen) {
    window.ChatBotComponent.checkMobileFullscreen();
    console.log('✅ Mobile detection logic triggered');
  }
  
  return {
    isMobile,
    chatWidgetExists: !!chatWidget,
    hasFullscreenClass: chatWidget?.classList.contains('fullscreen-mobile'),
    bodyScrollPrevented: bodyHasFullscreenClass
  };
}

// Test device orientations and keyboard awareness
function testOrientationChange() {
  console.log('\n🔄 Testing orientation change handling...');
  
  // Simulate orientation change
  window.dispatchEvent(new Event('resize'));
  console.log('📱 Resize event dispatched');
  
  setTimeout(() => {
    const chatWidget = document.querySelector('.chat-widget');
    if (chatWidget) {
      const hasFullscreenClass = chatWidget.classList.contains('fullscreen-mobile');
      console.log(`📱 Fullscreen class after resize: ${hasFullscreenClass}`);
    }
  }, 100);
}

// Test keyboard awareness features
function testKeyboardAwareness() {
  console.log('\n⌨️ Testing keyboard awareness features...');
  
  // Check CSS variables
  const deviceHeight = getComputedStyle(document.documentElement).getPropertyValue('--device-height');
  const keyboardHeight = getComputedStyle(document.documentElement).getPropertyValue('--keyboard-height');
  
  console.log(`📏 Device height CSS var: ${deviceHeight}`);
  console.log(`⌨️ Keyboard height CSS var: ${keyboardHeight}`);
  
  // Check VirtualKeyboard API support
  const hasVirtualKeyboard = "virtualKeyboard" in navigator;
  console.log(`🔧 VirtualKeyboard API support: ${hasVirtualKeyboard}`);
  
  // Check viewport meta tag
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  const hasInteractiveWidget = viewportMeta?.content.includes('interactive-widget=resizes-content');
  console.log(`📱 Interactive widget meta tag: ${hasInteractiveWidget}`);
  
  // Test visual viewport API
  const hasVisualViewport = !!window.visualViewport;
  console.log(`👁️ Visual Viewport API support: ${hasVisualViewport}`);
  
  if (hasVisualViewport) {
    console.log(`📐 Current viewport height: ${window.visualViewport.height}px`);
    console.log(`📐 Window inner height: ${window.innerHeight}px`);
  }
  
  return {
    deviceHeight,
    keyboardHeight,
    hasVirtualKeyboard,
    hasInteractiveWidget,
    hasVisualViewport
  };
}

// Test chat launcher visibility on mobile
function testLauncherVisibility() {
  console.log('\n🚀 Testing chat launcher visibility...');
  
  const launcher = document.querySelector('#chatLauncher');
  if (launcher) {
    const styles = window.getComputedStyle(launcher);
    console.log(`🎯 Launcher display: ${styles.display}`);
    console.log(`🎯 Launcher position: ${styles.position}`);
    console.log(`🎯 Launcher bottom: ${styles.bottom}`);
    console.log(`🎯 Launcher right: ${styles.right}`);
  } else {
    console.log('❌ Chat launcher not found');
  }
}

// Run all tests
function runFullTestSuite() {
  console.log('🏁 Running Full Mobile Fullscreen & Keyboard-Aware Test Suite\n');
  
  const results = testMobileFullscreen();
  const keyboardResults = testKeyboardAwareness();
  testOrientationChange();
  testLauncherVisibility();
  
  console.log('\n📊 Test Results Summary:');
  console.log('Mobile Fullscreen:', results);
  console.log('Keyboard Awareness:', keyboardResults);
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (results.isMobile && !results.hasFullscreenClass) {
    console.log('⚠️  Mobile device detected but fullscreen not activated - check chat open state');
  }
  if (results.hasFullscreenClass && !results.bodyScrollPrevented) {
    console.log('⚠️  Fullscreen active but body scroll not prevented - check CSS classes');
  }
  if (!results.chatWidgetExists) {
    console.log('⚠️  Chat widget not found - ensure chatbot is rendered');
  }
  if (!keyboardResults.hasInteractiveWidget) {
    console.log('⚠️  Interactive widget meta tag not found - may affect keyboard behavior');
  }
  if (!keyboardResults.hasVisualViewport) {
    console.log('⚠️  Visual Viewport API not supported - using fallback methods');
  }
  
  return { mobile: results, keyboard: keyboardResults };
}

// Make functions available globally for testing
window.testMobileFullscreen = testMobileFullscreen;
window.testKeyboardAwareness = testKeyboardAwareness;
window.runFullTestSuite = runFullTestSuite;
window.testOrientationChange = testOrientationChange;

console.log('✅ Mobile fullscreen & keyboard-aware test script loaded');
console.log('📱 Run: runFullTestSuite() to test all functionality');
console.log('🧪 Run: testMobileFullscreen() for basic mobile tests');
console.log('⌨️ Run: testKeyboardAwareness() for keyboard awareness tests');