import { useApplicationStore } from "../state/useApplicationStore";

export function Step2_Product() {
  const { update } = useApplicationStore();

  function select(category: string) {
    update({ productCategory: category });
    window.location.href = "/apply/step-3";
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Step 2: Choose Product Category</h1>
      <button className="bg-borealBlue text-white p-2 m-2" onClick={() => select("line_of_credit")}>
        Line of Credit
      </button>
      <button className="bg-borealBlue text-white p-2 m-2" onClick={() => select("factoring")}>
        Factoring
      </button>
      <button className="bg-borealBlue text-white p-2 m-2" onClick={() => select("term_loan")}>
        Term Loan
      </button>
    </div>
  );
}
