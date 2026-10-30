"use client";

import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};



const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative min-w-0 flex-1">
      <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
      type="search"
      aria-label="Search products"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search products..."
      className="h-11 w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50/70 pl-10 pr-3 text-base sm:text-sm transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
    />
    </div>
  );
};

export default SearchBar;
