import { useMemo, useState } from "react";
import { calculateReadinessScore, type ReadinessInput } from "../utils/readinessScore";
import { trackEvent } from "../utils/analytics";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onContinueApplication?: (score: number) => void;
};

const defaultInput: ReadinessInput = {
  yearsInBusiness: 0,
  annualRevenue: 0,
  creditScore: 600,
  industryRisk: "medium",
};

export function CapitalReadinessModal({ isOpen, onClose, onContinueApplication }: Props) {
  const [input, setInput] = useState<ReadinessInput>(defaultInput);
  const [score, setScore] = useState<number | null>(null);

  const gaugeWidth = useMemo(() => `${score ?? 0}%`, [score]);

  if (!isOpen) return null;

  function calculate() {
    const computed = calculateReadinessScore(input);
    setScore(computed);
    trackEvent("client_readiness_score_calculated", { score: computed });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Capital Readiness Score</h2>
          <button className="text-slate-500" onClick={onClose}>✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="border rounded-md p-2"
            type="number"
            min={0}
            placeholder="Years in business"
            value={input.yearsInBusiness}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, yearsInBusiness: Number(e.target.value || 0) }))
            }
          />
          <input
            className="border rounded-md p-2"
            type="number"
            min={0}
            placeholder="Annual revenue"
            value={input.annualRevenue}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, annualRevenue: Number(e.target.value || 0) }))
            }
          />
          <input
            className="border rounded-md p-2"
            type="number"
            min={300}
            max={850}
            placeholder="Credit score"
            value={input.creditScore}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, creditScore: Number(e.target.value || 0) }))
            }
          />
          <select
            className="border rounded-md p-2"
            value={input.industryRisk}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, industryRisk: e.target.value as ReadinessInput["industryRisk"] }))
            }
          >
            <option value="low">Low industry risk</option>
            <option value="medium">Medium industry risk</option>
            <option value="high">High industry risk</option>
          </select>
        </div>

        <button className="w-full bg-brand-surface text-white rounded-md p-3" onClick={calculate}>
          Calculate score
        </button>

        {score !== null && (
          <div className="space-y-2">
            <div className="text-sm text-slate-600">Your score: {score} / 100</div>
            <div className="w-full h-3 rounded-full bg-brand-bgAlt overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: gaugeWidth }} />
            </div>
            <button
              className="w-full bg-emerald-600 text-white rounded-md p-3"
              onClick={() => onContinueApplication?.(score)}
            >
              Continue application
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CapitalReadinessModal;
