export default function Loading() {
  return (
    <section className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl bg-white p-4 shadow-sm" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-white p-4 shadow-sm" />
    </section>
  );
}
