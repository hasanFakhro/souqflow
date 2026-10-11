import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export default function FilterSelect({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <select
        {...props}
        className="h-11 w-full min-w-0 appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-10 text-base text-gray-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:text-sm"
      >
        {children}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
    </div>
  );
}
