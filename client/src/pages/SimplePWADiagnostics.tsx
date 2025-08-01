export default function SimplePWADiagnostics() {
  const isServiceWorkerSupported = 'serviceWorker' in navigator;
  const isPushSupported = 'PushManager' in window;
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PWA Diagnostic Suite
          </h1>
          <p className="text-gray-600 mb-4">
            Progressive Web App feature status and testing interface
          </p>
          <div className="text-sm text-gray-500">
            Page loaded at: {new Date().toLocaleString()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Service Worker</h2>
            <p className={isServiceWorkerSupported ? "text-green-600" : "text-red-600"}>
              {isServiceWorkerSupported ? "✅ Supported" : "❌ Not Supported"}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Push Notifications</h2>
            <p className={isPushSupported ? "text-green-600" : "text-red-600"}>
              {isPushSupported ? "✅ Supported" : "❌ Not Supported"}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Network Status</h2>
            <p className={isOnline ? "text-green-600" : "text-orange-600"}>
              {isOnline ? "✅ Online" : "📴 Offline"}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Browser Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Service Worker:</strong> {isServiceWorkerSupported ? "Available" : "Not Available"}
            </div>
            <div>
              <strong>Push Manager:</strong> {isPushSupported ? "Available" : "Not Available"}
            </div>
            <div>
              <strong>Notifications:</strong> {'Notification' in window ? "Available" : "Not Available"}
            </div>
            <div>
              <strong>IndexedDB:</strong> {'indexedDB' in window ? "Available" : "Not Available"}
            </div>
            <div>
              <strong>Cache API:</strong> {'caches' in window ? "Available" : "Not Available"}
            </div>
            <div>
              <strong>Background Sync:</strong> {'serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype ? "Available" : "Not Available"}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
            >
              Refresh Page
            </button>
            <div className="text-sm text-gray-600">
              Use this page to verify PWA features are working correctly.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}