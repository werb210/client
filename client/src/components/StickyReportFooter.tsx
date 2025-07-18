export function StickyReportFooter() {

  const triggerReportModal = () => {
    // Trigger the existing floating report button
    const reportBtn = document.getElementById('reportBtn');
    if (reportBtn) {
      reportBtn.click();
    }
  };

  return (
    <>
      {/* Sticky Footer Bar */}
      <div
        id="reportFooter"
        className="fixed bottom-0 left-0 right-0 text-white py-3 px-4 text-sm text-center shadow-lg z-[999]"
        style={{
          background: '#005D2E',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
        }}
      >
        Do you have an issue?
        <button
          id="openReport"
          onClick={triggerReportModal}
          className="ml-3 px-3 py-1.5 rounded border-none cursor-pointer transition-colors duration-200"
          style={{
            background: 'rgba(255,255,255,0.15)',
            color: 'white'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >
          Report it
        </button>
      </div>
    </>
  );
}