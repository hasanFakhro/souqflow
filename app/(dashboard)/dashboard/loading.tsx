export default function Loading() {
  return (
    <section className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200" />
      <div className="h-11 animate-pulse rounded-lg bg-gray-100" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-2 rounded-lg bg-white p-2 shadow-sm">
            <div className="h-24 animate-pulse rounded-lg bg-gray-100 sm:h-32 lg:h-40" />
            <div className="h-4 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </section>
  );
}
