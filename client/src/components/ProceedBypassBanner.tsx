export const ProceedBypassBanner = ({ onBypass }: { onBypass: () => void }) => (
  <div className="mb-6 rounded-xl border border-orange-300 bg-orange-50 p-6">
    <p className="mb-4 text-sm text-orange-900">
      If you do not have the required documents ready at this time you can
      proceed, but understand this will greatly delay your application as it
      will not be sent to the Lender Partners until all have been received.
    </p>
    <button
      type="button"
      onClick={onBypass}
      className="inline-flex items-center rounded-md border border-gray-400 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
    >
      Proceed without Required Documents
    </button>
  </div>
);