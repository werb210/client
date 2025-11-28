import classNames from "classnames";

type YesNoProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export function YesNo({ label, value, onChange }: YesNoProps) {
  return (
    <div className="flex flex-col gap-2 text-sm font-medium text-gray-900">
      <span>{label}</span>
      <div className="flex gap-3">
        {[
          { label: "Yes", val: true },
          { label: "No", val: false },
        ].map((option) => {
          const active = value === option.val;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => onChange(option.val)}
              className={classNames(
                "rounded-lg border px-4 py-2 text-sm font-semibold",
                active
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
