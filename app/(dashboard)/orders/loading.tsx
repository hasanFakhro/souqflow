
export default function Loading() {
  return (
    <section className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200" />

      {/* Filters / search skeleton */}
      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="h-11 flex-1 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-11 w-32 animate-pulse rounded-lg bg-gray-100" />
      </div>

      {/* Orders table skeleton */}
      <div className="overflow-x-auto rounded-xl bg-white p-4 shadow-sm">
        <div className="space-y-4">
          {/* Table header */}
          <div className="h-10 animate-pulse rounded-lg bg-gray-100" />

          {/* Table rows */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="grid min-w-[900px] grid-cols-7 gap-4 border-b border-gray-100 py-4"
            >
              <div className="h-5 animate-pulse rounded bg-gray-100" />
              <div className="h-5 animate-pulse rounded bg-gray-100" />
              <div className="h-5 animate-pulse rounded bg-gray-100" />
              <div className="h-5 animate-pulse rounded bg-gray-100" />
              <div className="h-5 animate-pulse rounded bg-gray-100" />
              <div className="h-5 animate-pulse rounded bg-gray-100" />
              <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
