import { useApplicationStore } from "../state/useApplicationStore";

export function Step1_KYC() {
  const { app, update } = useApplicationStore();

  function next() {
    update({ kyc: { ...app.kyc } });
    window.location.href = "/apply/step-2";
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Step 1: Basic Questions</h1>
      <label className="block mb-2">
        Business Country:
        <select
          className="border p-2 w-full"
          value={app.kyc.country || ""}
          onChange={(e) => update({ kyc: { ...app.kyc, country: e.target.value } })}
        >
          <option value="">Select…</option>
          <option value="canada">Canada</option>
          <option value="usa">USA</option>
        </select>
      </label>

      <label className="block mb-2">
        Funding Amount Needed:
        <input
          className="border p-2 w-full"
          type="number"
          value={app.kyc.amount || ""}
          onChange={(e) =>
            update({ kyc: { ...app.kyc, amount: Number(e.target.value) } })
          }
        />
      </label>

      <label className="block mb-4">
        Revenue Type:
        <select
          className="border p-2 w-full"
          value={app.kyc.revenueType || ""}
          onChange={(e) =>
            update({ kyc: { ...app.kyc, revenueType: e.target.value } })
          }
        >
          <option value="">Select…</option>
          <option value="invoices">I invoice customers (Factoring)</option>
          <option value="asset_based">Asset Based / LOC</option>
          <option value="fixed_payment">Fixed Payment Loans</option>
        </select>
      </label>

      <button className="bg-borealBlue text-white p-2" onClick={next}>
        Continue
      </button>
    </div>
  );
}
