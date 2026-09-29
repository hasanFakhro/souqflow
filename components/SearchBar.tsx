"use client";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};



const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <input
      type="search"
      aria-label="Search products"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search products..."
      className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 sm:px-4 sm:py-2.5 sm:text-base"
    />
  );
};

export default SearchBar;
