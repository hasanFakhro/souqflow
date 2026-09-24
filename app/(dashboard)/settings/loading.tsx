export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
      <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-11 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
