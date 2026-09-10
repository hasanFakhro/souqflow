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
      className="w-full max-w-sm rounded-lg shadow-sm px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
    />
  );
};

export default SearchBar;