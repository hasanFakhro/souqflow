export default function Loading() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
      </div>
      <div className="overflow-x-auto rounded-xl bg-white p-4 shadow-sm">
        <div className="space-y-4">
          <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid min-w-[900px] grid-cols-6 gap-4 border-b border-gray-100 py-4">
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
