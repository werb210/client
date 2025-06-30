import { useState } from "react";
import { Link } from "wouter";

interface PageVariant {
  name: string;
  route: string;
  status: 'current' | 'v2' | 'legacy' | 'new';
  description?: string;
}

interface PageGroup {
  category: string;
  description: string;
  variants: PageVariant[];
}

const pageGroups: PageGroup[] = [
  {
    category: "Landing Pages",
    description: "Main entry points for users",
    variants: [
      { name: "Landing Page (Professional)", route: "/", status: 'new', description: "Main landing page with Boreal branding" },
    ]
  },
  {
    category: "Dashboards & Portals", 
    description: "User portal and dashboard interfaces",
    variants: [
      { name: "Dashboard (Legacy)", route: "/dashboard", status: 'legacy', description: "Original dashboard layout" },
      { name: "Portal Page (Modern)", route: "/portal", status: 'v2', description: "Modern portal with V2 styling" },
    ]
  },
  {
    category: "Application Steps",
    description: "Multi-step application form components",
    variants: [
      { name: "Step 1 - Financial Profile", route: "/step1", status: 'current', description: "Business basics form" },
      { name: "Step 2 - Business Details", route: "/step2", status: 'current', description: "Detailed business information" },
      { name: "Step 3 - Financial Information", route: "/step3", status: 'current', description: "Financial details and revenue" },
      { name: "Step 4 - Document Upload", route: "/step4", status: 'current', description: "Document submission" },
      { name: "Step 5 - Summary & Review", route: "/step5", status: 'current', description: "Application review" },
    ]
  },
  {
    category: "Authentication",
    description: "Login and registration pages",
    variants: [
      { name: "Login Page", route: "/login", status: 'current', description: "User authentication" },
      { name: "Register Page", route: "/register", status: 'current', description: "New user registration" },
    ]
  },
  {
    category: "Support & Admin",
    description: "Help, admin, and management interfaces",
    variants: [
      { name: "FAQ Page", route: "/faq", status: 'current', description: "Frequently asked questions" },
      { name: "Troubleshooting", route: "/troubleshooting", status: 'current', description: "Help and support" },
      { name: "Product Admin", route: "/admin", status: 'current', description: "Administrative interface" },
    ]
  },
  {
    category: "Error Pages",
    description: "Error and fallback pages",
    variants: [
      { name: "404 Not Found", route: "/404", status: 'current', description: "Page not found error" },
    ]
  }
];

export default function PageComparison() {
  const [selectedGroup, setSelectedGroup] = useState<PageGroup | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<PageVariant[]>([]);
  const [approvedPages, setApprovedPages] = useState<Set<string>>(new Set());

  const handleSelectGroup = (group: PageGroup) => {
    setSelectedGroup(group);
    setSelectedVariants(group.variants);
  };

  const handleApprove = (variantName: string) => {
    setApprovedPages(prev => new Set([...prev, variantName]));
  };

  const handleReject = (variantName: string) => {
    setApprovedPages(prev => {
      const newSet = new Set(prev);
      newSet.delete(variantName);
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'v2': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'new': return 'bg-green-100 text-green-800 border-green-200';
      case 'legacy': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Page Version Comparison Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Compare different page versions side-by-side and select the preferred implementation for V2 modernization
          </p>
          <Link href="/_showcase">
            <button className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              ← Back to Page Showcase
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Category Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Page Categories</h2>
              <div className="space-y-3">
                {pageGroups.map((group) => (
                  <button
                    key={group.category}
                    onClick={() => handleSelectGroup(group)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedGroup?.category === group.category
                        ? 'bg-blue-50 border-blue-300 text-blue-900'
                        : 'bg-gray-50 border-gray-200 hover:bg-blue-50'
                    }`}
                  >
                    <div className="font-semibold">{group.category}</div>
                    <div className="text-sm text-gray-600 mt-1">{group.description}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      {group.variants.length} variant{group.variants.length !== 1 ? 's' : ''}
                    </div>
                  </button>
                ))}
              </div>

              {/* Approved Pages Summary */}
              {approvedPages.size > 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Approved Pages ({approvedPages.size})</h3>
                  <div className="text-sm text-green-800">
                    {Array.from(approvedPages).map(page => (
                      <div key={page} className="truncate">✓ {page}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Page Comparison */}
          <div className="lg:col-span-2">
            {!selectedGroup ? (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
                <div className="text-gray-500 text-lg">
                  Select a category from the left to compare page variants
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedGroup.category}</h2>
                  <p className="text-gray-600 mb-4">{selectedGroup.description}</p>
                  
                  <div className="grid gap-4">
                    {selectedVariants.map((variant) => (
                      <div key={variant.name} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900">{variant.name}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(variant.status)}`}>
                              {variant.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(variant.name)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                approvedPages.has(variant.name)
                                  ? 'bg-green-600 text-white'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {approvedPages.has(variant.name) ? '✓ Approved' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(variant.name)}
                              className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                        
                        {/* Page Info */}
                        <div className="border border-gray-300 rounded-lg bg-gray-50 p-4">
                          <div className="text-center text-gray-600">
                            <div className="text-2xl mb-2">📄</div>
                            <div className="font-medium">{variant.name}</div>
                            <div className="text-sm mt-1">{variant.description}</div>
                            <div className="text-xs mt-2 text-gray-500">Route: {variant.route}</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex gap-2">
                          <Link href={variant.route}>
                            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                              View Page →
                            </button>
                          </Link>
                          <button 
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            onClick={() => {
                              navigator.clipboard.writeText(variant.route);
                              alert('Route copied to clipboard');
                            }}
                          >
                            Copy Route
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-orange-900 mb-3">Next Steps</h3>
                  <div className="text-orange-800 space-y-2">
                    <p>• Review each variant by clicking "View Full Page"</p>
                    <p>• Click "Approve" for the version you want to keep</p>
                    <p>• I'll apply V2 Boreal Financial styling to approved pages</p>
                    <p>• Rejected variants will be archived or removed</p>
                  </div>
                  
                  {approvedPages.size > 0 && (
                    <button 
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      onClick={() => {
                        const approved = Array.from(approvedPages).join('\n- ');
                        alert(`Ready to modernize these approved pages:\n\n- ${approved}\n\nI'll now apply V2 Boreal Financial styling!`);
                      }}
                    >
                      Apply V2 Styling to {approvedPages.size} Approved Page{approvedPages.size !== 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}