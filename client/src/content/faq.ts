export const faqContent = [
  {
    category: "General",
    questions: [
      {
        question: "What is Boreal Financial?",
        answer: "Boreal Financial is a comprehensive lending platform that connects businesses with funding opportunities. We specialize in matching companies with the right financial products based on their specific needs, industry, and financial profile."
      },
      {
        question: "How does the application process work?",
        answer: "Our application process is streamlined into 5 main steps: 1) Financial Profile setup, 2) AI-powered recommendations, 3) Business details, 4) Applicant information, and 5) Document upload. The entire process typically takes 15-30 minutes to complete."
      },
      {
        question: "Is my information secure?",
        answer: "Yes, we use enterprise-grade security including SHA-256 encryption, secure file uploads, and strict data protection protocols. All sensitive information is encrypted both in transit and at rest."
      }
    ]
  },
  {
    category: "Applications",
    questions: [
      {
        question: "What types of funding are available?",
        answer: "We offer various funding options including term loans, lines of credit, equipment financing, working capital, invoice factoring, and merchant cash advances. Each product is tailored to specific business needs and industries."
      },
      {
        question: "How long does approval take?",
        answer: "Approval times vary by product type and complexity. Most applications receive initial feedback within 24-48 hours, with full approval decisions typically within 5-7 business days."
      },
      {
        question: "What documents do I need?",
        answer: "Required documents vary by loan type but typically include bank statements, tax returns, financial statements, and business licenses. Our system provides a personalized document checklist based on your selected funding type."
      },
      {
        question: "Can I track my application status?",
        answer: "Yes, you can monitor your application progress in real-time through your portal dashboard. You'll receive updates at each stage of the review process."
      }
    ]
  },
  {
    category: "Eligibility",
    questions: [
      {
        question: "What are the minimum requirements?",
        answer: "Requirements vary by product, but generally include: business operating for at least 6 months, minimum monthly revenue thresholds, and acceptable credit profiles. Our recommendation engine will show products you qualify for."
      },
      {
        question: "Do you serve both US and Canadian businesses?",
        answer: "Yes, we serve businesses in both the United States and Canada, with region-specific products and compliance requirements built into our platform."
      },
      {
        question: "What industries do you work with?",
        answer: "We work with most industries including retail, manufacturing, professional services, healthcare, construction, and technology. Some specialized industries may have specific product options."
      }
    ]
  },
  {
    category: "Technical",
    questions: [
      {
        question: "Why am I having login issues?",
        answer: "Login issues are typically related to browser cache or network connectivity. Try clearing your browser cache, disabling ad blockers, or switching to an incognito/private browsing window."
      },
      {
        question: "My file upload is failing. What should I do?",
        answer: "Ensure your files are under 25MB, in supported formats (PDF, JPG, PNG, DOC, DOCX), and that you have a stable internet connection. If issues persist, try uploading one file at a time."
      },
      {
        question: "The system says my backend connection failed. What does this mean?",
        answer: "This indicates a temporary connectivity issue with our servers. Wait a few minutes and try again. If the problem persists, contact our support team."
      }
    ]
  }
];

export const faqCategories = faqContent.map(category => category.category);