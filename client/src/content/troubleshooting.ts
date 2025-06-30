export const troubleshootingContent = [
  {
    category: "Login & Authentication",
    issues: [
      {
        problem: "Cannot log in - invalid credentials error",
        solution: "1. Double-check your email and password for typos\n2. Try resetting your password using the 'Forgot Password' link\n3. Clear your browser cache and cookies\n4. Disable browser extensions temporarily\n5. Try logging in from an incognito/private window",
        severity: "medium"
      },
      {
        problem: "Page shows 'Backend connection failed' error",
        solution: "1. Check your internet connection\n2. Wait 2-3 minutes and refresh the page\n3. Try accessing from a different browser\n4. Contact support if the issue persists for more than 15 minutes",
        severity: "high"
      },
      {
        problem: "SMS verification code not received",
        solution: "1. Check that your phone number was entered correctly\n2. Wait up to 5 minutes for delivery\n3. Check your SMS/message blocking settings\n4. Try requesting a new code (available after 15 seconds)\n5. Contact support if codes consistently fail to arrive",
        severity: "medium"
      }
    ]
  },
  {
    category: "Application Process",
    issues: [
      {
        problem: "Form won't submit - validation errors",
        solution: "1. Scroll through all form sections to check for red error messages\n2. Ensure all required fields (marked with *) are completed\n3. Verify phone numbers are in correct format\n4. Check date fields are properly formatted\n5. Try submitting one section at a time",
        severity: "medium"
      },
      {
        problem: "File upload fails or gets stuck",
        solution: "1. Check file size is under 25MB\n2. Ensure file format is supported (PDF, JPG, PNG, DOC, DOCX)\n3. Try uploading files one at a time\n4. Check your internet connection stability\n5. Clear browser cache and try again\n6. Use a different browser if issues persist",
        severity: "medium"
      },
      {
        problem: "Recommendation engine shows no products",
        solution: "1. Review your business profile information for accuracy\n2. Try adjusting your funding amount range\n3. Verify your business location (US/Canada) is correct\n4. Check that your industry selection matches your business type\n5. Contact support if you believe you should see matching products",
        severity: "high"
      },
      {
        problem: "Document validation shows 'suspicious' or 'invalid' status",
        solution: "1. Ensure documents are authentic business records (not samples or templates)\n2. Upload high-quality scans or original digital documents\n3. Verify document content matches your business information\n4. Re-upload documents if they were corrupted during transfer\n5. Contact support for manual review if needed",
        severity: "high"
      }
    ]
  },
  {
    category: "Browser & Technical",
    issues: [
      {
        problem: "Page loads slowly or times out",
        solution: "1. Check your internet connection speed\n2. Close other browser tabs and applications\n3. Clear browser cache and cookies\n4. Disable ad blockers and browser extensions\n5. Try switching to a different browser (Chrome, Firefox, Safari)\n6. Restart your router if using WiFi",
        severity: "medium"
      },
      {
        problem: "Site appears broken or missing content",
        solution: "1. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)\n2. Clear browser cache completely\n3. Disable all browser extensions\n4. Check if JavaScript is enabled in browser settings\n5. Try accessing from an incognito/private window\n6. Update your browser to the latest version",
        severity: "high"
      },
      {
        problem: "Mobile app/site not working properly",
        solution: "1. Update your mobile browser to the latest version\n2. Clear browser data and cache\n3. Try using desktop/laptop instead\n4. Ensure you have a stable mobile data or WiFi connection\n5. Close other apps running in background\n6. Restart your mobile device",
        severity: "medium"
      }
    ]
  },
  {
    category: "Data & Privacy",
    issues: [
      {
        problem: "Cannot access my saved application",
        solution: "1. Ensure you're logged into the correct account\n2. Check if you started the application on a different device\n3. Clear browser cache and log in again\n4. Contact support with your registered email for account recovery",
        severity: "high"
      },
      {
        problem: "Want to delete my account and data",
        solution: "1. Log into your account and go to Settings\n2. Contact support to request account deletion\n3. All personal data will be removed within 30 days\n4. Download any important documents before deletion\n5. Note that legal records may be retained per compliance requirements",
        severity: "low"
      },
      {
        problem: "Concerned about data security",
        solution: "1. All data is encrypted using enterprise-grade SHA-256 encryption\n2. Files are securely transmitted and stored\n3. We comply with applicable privacy regulations\n4. Access is logged and monitored\n5. Contact our privacy team for specific security questions",
        severity: "low"
      }
    ]
  }
];

export const troubleshootingCategories = troubleshootingContent.map(category => category.category);

export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};