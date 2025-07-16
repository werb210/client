/**
 * TEST STEP 4 AUTO-SAVE
 * Run this in browser console to verify Step 4 auto-save is working
 */

function testStep4AutoSave() {
  console.log("🔍 TESTING STEP 4 AUTO-SAVE");
  console.log("===========================");

  // Check current localStorage data
  const formData = localStorage.getItem('formData');
  const financialFormData = localStorage.getItem('financialFormData');
  
  console.log("📦 localStorage Keys Found:");
  console.log("- formData:", !!formData);
  console.log("- financialFormData:", !!financialFormData);
  
  if (formData) {
    try {
      const parsed = JSON.parse(formData);
      console.log("");
      console.log("📋 CURRENT STEP 4 DATA IN LOCALSTORAGE:");
      console.log("step4 object:", parsed.step4);
      console.log("");
      console.log("Root level applicant data:");
      console.log("- applicantFirstName:", parsed.applicantFirstName);
      console.log("- applicantLastName:", parsed.applicantLastName);
      console.log("- applicantEmail:", parsed.applicantEmail);
      console.log("- applicantPhone:", parsed.applicantPhone);
      
      // Check if step4 object has the data
      if (parsed.step4 && Object.keys(parsed.step4).length > 0) {
        console.log("");
        console.log("✅ STEP 4 AUTO-SAVE IS WORKING!");
        console.log("Data is properly saved in step4 object structure");
      } else {
        console.log("");
        console.log("❌ STEP 4 AUTO-SAVE ISSUE DETECTED");
        console.log("step4 object is empty or missing");
      }
      
    } catch (error) {
      console.error("Error parsing formData:", error);
    }
  } else {
    console.log("❌ No formData found in localStorage");
  }
  
  // Test auto-save by monitoring localStorage changes
  console.log("");
  console.log("🔄 MONITORING AUTO-SAVE (fill out a Step 4 field now)...");
  
  let lastData = formData;
  const monitor = setInterval(() => {
    const currentData = localStorage.getItem('formData');
    if (currentData !== lastData) {
      console.log("🔔 DETECTED CHANGE in localStorage!");
      try {
        const parsed = JSON.parse(currentData);
        console.log("Updated step4 data:", parsed.step4);
        lastData = currentData;
      } catch (error) {
        console.error("Error parsing updated data:", error);
      }
    }
  }, 1000);
  
  // Stop monitoring after 30 seconds
  setTimeout(() => {
    clearInterval(monitor);
    console.log("🛑 Stopped monitoring auto-save");
  }, 30000);
}

testStep4AutoSave();