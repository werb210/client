import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { saveStep1 } from "../api/application";
import { useApplication } from "../store/application";
import { useAuth } from "../store/auth";
import { Step1Payload } from "../types/application";

function createInitialForm(
  user: ReturnType<typeof useAuth>["user"],
  existing?: Step1Payload | null
): Step1Payload {
  return {
    firstName: existing?.firstName ?? "",
    lastName: existing?.lastName ?? "",
    companyName: existing?.companyName ?? "",
    province: existing?.province ?? "",
    ownership: existing?.ownership ?? "yes",
    ownershipPercent: existing?.ownershipPercent ?? "",
    yearsInBusiness: existing?.yearsInBusiness ?? "",
    yearFounded: existing?.yearFounded ?? "",
    monthlyRevenue: existing?.monthlyRevenue ?? "",
    monthlyExpenses: existing?.monthlyExpenses ?? "",
    profitableLastYear: existing?.profitableLastYear ?? "",
    profitableYTD: existing?.profitableYTD ?? "",
    website: existing?.website ?? "",
    phone: existing?.phone ?? user?.phone ?? "",
    email: existing?.email ?? user?.email ?? "",
    industry: existing?.industry ?? "",
    existingLoans: existing?.existingLoans ?? "no",
    loanAmount: existing?.loanAmount ?? "",
    employees: existing?.employees ?? "",
    acceptsCards: existing?.acceptsCards ?? "no",
    cardVolume: existing?.cardVolume ?? "",
    craDebt: existing?.craDebt ?? "no",
    craDebtAmount: existing?.craDebtAmount ?? "",
    bankruptcy: existing?.bankruptcy ?? "no"
  };
}

export default function Step1() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { step1, setStep1 } = useApplication();

  const [form, setForm] = useState<Step1Payload>(() =>
    createInitialForm(user, step1)
  );

  useEffect(() => {
    if (step1) {
      setForm(step1);
      return;
    }

    setForm((prev) => ({
      ...prev,
      phone: user?.phone ?? prev.phone,
      email: user?.email ?? prev.email
    }));
  }, [step1, user]);

  function update(field: keyof Step1Payload, value: string) {
    setForm((prev) => {
      const updated: Step1Payload = { ...prev, [field]: value };

      if (field === "ownership" && value !== "yes") {
        updated.ownershipPercent = "";
      }

      if (field === "existingLoans" && value !== "yes") {
        updated.loanAmount = "";
      }

      if (field === "acceptsCards" && value !== "yes") {
        updated.cardVolume = "";
      }

      if (field === "craDebt" && value !== "yes") {
        updated.craDebtAmount = "";
      }

      return updated;
    });
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await saveStep1(form);
    setStep1(form);
    navigate("/step-2");
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Step 1 — KYC Information</h1>

      <form onSubmit={submit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">First Name</label>
            <input
              className="border p-3 w-full rounded"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Last Name</label>
            <input
              className="border p-3 w-full rounded"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Company Legal Name
          </label>
          <input
            className="border p-3 w-full rounded"
            value={form.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Province</label>
          <input
            className="border p-3 w-full rounded"
            value={form.province}
            onChange={(e) => update("province", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Do you own the company?
          </label>
          <select
            className="border p-3 w-full rounded"
            value={form.ownership}
            onChange={(e) => update("ownership", e.target.value)}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        {form.ownership === "yes" && (
          <div>
            <label className="block mb-1 text-sm font-medium">
              Percentage Ownership
            </label>
            <input
              className="border p-3 w-full rounded"
              value={form.ownershipPercent}
              onChange={(e) => update("ownershipPercent", e.target.value)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              How long have you been in business?
            </label>
            <input
              className="border p-3 w-full rounded"
              value={form.yearsInBusiness}
              onChange={(e) => update("yearsInBusiness", e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Year Founded</label>
            <input
              className="border p-3 w-full rounded"
              value={form.yearFounded}
              onChange={(e) => update("yearFounded", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Monthly Gross Revenue
            </label>
            <input
              className="border p-3 w-full rounded"
              value={form.monthlyRevenue}
              onChange={(e) => update("monthlyRevenue", e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Average Monthly Expenses
            </label>
            <input
              className="border p-3 w-full rounded"
              value={form.monthlyExpenses}
              onChange={(e) => update("monthlyExpenses", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Was the company profitable last year?
            </label>
            <select
              className="border p-3 w-full rounded"
              value={form.profitableLastYear}
              onChange={(e) => update("profitableLastYear", e.target.value)}
            >
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Profit year-to-date?
            </label>
            <select
              className="border p-3 w-full rounded"
              value={form.profitableYTD}
              onChange={(e) => update("profitableYTD", e.target.value)}
            >
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Website URL</label>
          <input
            className="border p-3 w-full rounded"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Phone Number</label>
            <input
              className="border p-3 w-full rounded"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              className="border p-3 w-full rounded bg-gray-100"
              value={form.email}
              readOnly
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Industry Type</label>
          <input
            className="border p-3 w-full rounded"
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Does the business have existing loans?
          </label>
          <select
            className="border p-3 w-full rounded"
            value={form.existingLoans}
            onChange={(e) => update("existingLoans", e.target.value)}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        {form.existingLoans === "yes" && (
          <div>
            <label className="block mb-1 text-sm font-medium">
              Total Outstanding Loan Amount
            </label>
            <input
              className="border p-3 w-full rounded"
              value={form.loanAmount}
              onChange={(e) => update("loanAmount", e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="block mb-1 text-sm font-medium">
            Number of Employees
          </label>
          <input
            className="border p-3 w-full rounded"
            value={form.employees}
            onChange={(e) => update("employees", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Do you accept credit cards?
          </label>
          <select
            className="border p-3 w-full rounded"
            value={form.acceptsCards}
            onChange={(e) => update("acceptsCards", e.target.value)}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        {form.acceptsCards === "yes" && (
          <div>
            <label className="block mb-1 text-sm font-medium">
              Monthly Card Volume
            </label>
            <input
              className="border p-3 w-full rounded"
              value={form.cardVolume}
              onChange={(e) => update("cardVolume", e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="block mb-1 text-sm font-medium">CRA Debt?</label>
          <select
            className="border p-3 w-full rounded"
            value={form.craDebt}
            onChange={(e) => update("craDebt", e.target.value)}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        {form.craDebt === "yes" && (
          <div>
            <label className="block mb-1 text-sm font-medium">
              CRA Debt Amount
            </label>
            <input
              className="border p-3 w-full rounded"
              value={form.craDebtAmount}
              onChange={(e) => update("craDebtAmount", e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="block mb-1 text-sm font-medium">
            Any personal bankruptcies?
          </label>
          <select
            className="border p-3 w-full rounded"
            value={form.bankruptcy}
            onChange={(e) => update("bankruptcy", e.target.value)}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        <button className="bg-borealBlue text-white px-4 py-3 rounded w-full font-semibold">
          Continue to Step 2
        </button>
      </form>
    </div>
  );
}
