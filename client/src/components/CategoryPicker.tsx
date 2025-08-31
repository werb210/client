import React, { useEffect, useMemo, useState } from "react";
import CategoryCard from "./CategoryCard";
import { groupByCategory, CATEGORY_LABEL, type Category, type Product } from "../lib/categories";

const LS_KEY = "bf:step2:category";

export default function CategoryPicker(props: {
  products: Product[];
  answers: { country?: string; amountRequested?: number; loanAmount?: number };
  onPicked?: (cat: Category) => void;
}) {
  const amount = (props.answers.amountRequested ?? props.answers.loanAmount) as number | undefined;
  const groups = useMemo(
    () => groupByCategory(props.products, { country: props.answers.country, amount }),
    [props.products, props.answers.country, amount]
  );
  const [picked, setPicked] = useState<Category | null>(null);

  useEffect(() => {
    const prev = window.localStorage.getItem(LS_KEY);
    if (prev && CATEGORY_LABEL[prev as Category]) setPicked(prev as Category);
  }, []);

  useEffect(() => {
    if (picked) {
      window.localStorage.setItem(LS_KEY, picked);
      props.onPicked?.(picked);
    }
  }, [picked]);

  if (!groups.length) {
    return <div className="text-sm text-gray-500">No categories available for your profile.</div>;
  }

  return (
    <div>
      {groups.map(g =>
        <CategoryCard
          key={g.key}
          group={g}
          selected={picked === g.key}
          onSelect={(k) => setPicked(k as Category)}
        />
      )}
    </div>
  );
}
