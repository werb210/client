import { Link } from "wouter";

const pages = [
  // Landing & Authentication
  { name: "🏠 Landing Page (V2 Professional)", path: "/_show/landing" },
  { name: "🔑 Login Page", path: "/_show/login" },
  { name: "📝 Register Page", path: "/_show/register" },
  
  // Dashboards & Portals
  { name: "📊 Portal/Dashboard (V2 Professional)", path: "/_show/portal" },
  { name: "📈 Legacy Dashboard", path: "/_show/legacy-dashboard" },
  
  // Application Steps 1-7
  { name: "1️⃣ Step 1: Financial Profile", path: "/_show/step1" },
  { name: "2️⃣ Step 2: Recommendations", path: "/_show/step2" },
  { name: "3️⃣ Step 3: Business Details", path: "/_show/step3" },
  { name: "4️⃣ Step 4: Financial Info", path: "/_show/step4" },
  { name: "5️⃣ Step 5: Document Upload", path: "/_show/step5" },
  { name: "6️⃣ Step 6: Signature", path: "/_show/step6" },
  
  // Additional Application Types
  { name: "📋 Comprehensive Application", path: "/_show/comprehensive" },
  { name: "📄 Document Validation Demo", path: "/_show/document-validation" },
  
  // Support & Administrative
  { name: "❓ FAQ Page", path: "/_show/faq" },
  { name: "🔧 Troubleshooting", path: "/_show/troubleshooting" },
  { name: "⚙️ Product Admin", path: "/_show/product-admin" },
  { name: "❌ 404 Not Found", path: "/_show/not-found" },
];

export default function PageShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Boreal Financial V2 Page Showcase
          </h1>
          <p className="text-lg text-gray-600">
            Review all V1 pages to apply V2 professional styling systematically
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map(page => (
              <Link key={page.path} href={page.path}>
                <button className="w-full text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-lg p-4 transition-colors group">
                  <div className="font-semibold text-blue-900 group-hover:text-blue-800">
                    {page.name}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    {page.path}
                  </div>
                </button>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-orange-900 mb-3">
            Instructions for V2 Style Guide Application
          </h2>
          <div className="text-orange-800 space-y-2">
            <p>• Click each page to review its current styling</p>
            <p>• Identify which pages need V2 Boreal Financial branding</p>
            <p>• Apply Navy (#003D7A) and Orange (#FF8C00) color scheme</p>
            <p>• Use modern typography (Inter font family)</p>
            <p>• Implement professional gradient backgrounds</p>
            <p>• Add consistent form styling and button designs</p>
          </div>
        </div>
      </div>
    </div>
  );
}