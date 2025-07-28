// Test Step 5 Document Upload System Activation
// Run this in browser console to verify Step 5 is truly working

console.log("🧪 STEP 5 ACTIVATION TEST STARTING...");

// Test 1: Check environment variables
console.log("📋 Environment Variables:");
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("VITE_CLIENT_APP_SHARED_TOKEN:", import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN ? "Present" : "Missing");

// Test 2: Check if Step 5 route is accessible
async function testStep5Route() {
    try {
        const response = await fetch('/apply/step-5');
        console.log("✅ Step 5 route accessible:", response.status === 200);
        return response.status === 200;
    } catch (error) {
        console.error("❌ Step 5 route error:", error);
        return false;
    }
}

// Test 3: Test upload endpoint (without file)
async function testUploadEndpoint() {
    try {
        const testApplicationId = "test-app-123";
        const response = await fetch(`/api/public/upload/${testApplicationId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
            }
        });
        
        console.log("📤 Upload endpoint response:", response.status);
        
        if (response.status === 400) {
            const error = await response.json();
            if (error.message === "No file was uploaded") {
                console.log("✅ Upload endpoint working (properly rejects empty requests)");
                return true;
            }
        }
        
        if (response.status === 401) {
            console.log("❌ Bearer token authentication failed");
            return false;
        }
        
        console.log("🤔 Unexpected upload response:", await response.text());
        return false;
        
    } catch (error) {
        console.error("❌ Upload endpoint error:", error);
        return false;
    }
}

// Test 4: Check document requirements system
function testDocumentRequirements() {
    // Check if DynamicDocumentRequirements component exists
    const stepComponents = document.querySelectorAll('[class*="step"], [id*="step"]');
    console.log("📋 Found step-related elements:", stepComponents.length);
    
    // Look for file upload inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    console.log("📎 File input elements found:", fileInputs.length);
    
    return fileInputs.length > 0;
}

// Run all tests
async function runAllTests() {
    console.log("\n🧪 Running Step 5 Activation Tests...\n");
    
    const routeTest = await testStep5Route();
    const uploadTest = await testUploadEndpoint();
    const requirementsTest = testDocumentRequirements();
    
    console.log("\n📊 TEST RESULTS:");
    console.log("Route Accessible:", routeTest ? "✅" : "❌");
    console.log("Upload Endpoint:", uploadTest ? "✅" : "❌");
    console.log("Document UI:", requirementsTest ? "✅" : "❌");
    
    const allPassed = routeTest && uploadTest && requirementsTest;
    console.log("\n🎯 OVERALL STATUS:", allPassed ? "✅ STEP 5 WORKING" : "❌ ISSUES FOUND");
    
    if (!allPassed) {
        console.log("\n🔧 RECOMMENDED ACTIONS:");
        if (!routeTest) console.log("- Fix Step 5 routing");
        if (!uploadTest) console.log("- Fix Bearer token or upload endpoint");
        if (!requirementsTest) console.log("- Navigate to Step 5 to test document UI");
    }
    
    return allPassed;
}

// Auto-run the test
runAllTests();