"use client";

import { useState, type Ref } from "react";
import { useCurrency, useExchangeRate } from "@/app/(dashboard)/currency";

// Form values remain in USD. Only the displayed/entered amount is converted.
export default function MoneyInput({ value, onChange, onBlur, ref, ...props }: {
  id: string;
  name: string;
  value: unknown;
  onChange: (amountUsd: number | "") => void;
  onBlur: () => void;
  ref?: Ref<HTMLInputElement>;
  disabled?: boolean;
  className?: string;
}) {
  const currency = useCurrency();
  const rate = useExchangeRate();
  const factor = currency === "LBP" ? rate : 1;
  const [draft, setDraft] = useState<{ text: string; amount: number | ""; factor: number | null } | null>(null);
  const display = value === "" || factor === null ? "" : String(Number((Number(value ?? 0) * factor).toFixed(currency === "LBP" ? 0 : 2)));
  const currentDraft = draft?.amount === value && draft?.factor === factor ? draft.text : display;

  return (
    <input
      {...props}
      ref={ref}
      type="number"
      inputMode="decimal"
      min="0"
      step={currency === "LBP" ? "1" : "0.01"}
      disabled={props.disabled || factor === null}
      placeholder={factor === null ? "Loading exchange rate..." : undefined}
      value={currentDraft}
      onChange={(event) => {
        if (factor === null) return;
        const text = event.target.value;
        const amount = text === "" ? "" : Number(text) / factor;
        setDraft({ text, amount, factor });
        onChange(amount);
      }}
      onBlur={() => { setDraft(null); onBlur(); }}
    />
  );
}
