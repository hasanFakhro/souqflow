"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { BarChart3, CalendarDays, PackageOpen } from "lucide-react";
import { formatPrice, useCurrency, useExchangeRate } from "../currency";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

type TimeRange = "daily" | "monthly" | "yearly";
type SalesBreakdown = "category-money" | "category-quantity" | "item-money" | "item-quantity";
type BarMetric = "sales" | "cost" | "profit";

type AnalyticsOrder = {
  id: string;
  orderedAt: string;
  items: Array<{
    category: string | null;
    productId: string | null;
    productName: string;
    quantity: number;
    unitCost: number;
    unitPrice: number;
  }>;
};

type AnalyticsProduct = {
  id: string;
  sku: string | null;
  name: string;
  category: string | null;
  costPrice: number;
  sellPrice: number;
};

type SalesAnalyticsProps = {
  orders: AnalyticsOrder[];
  products: AnalyticsProduct[];
};

type ChartBucket = {
  key: string;
  label: string;
  cost: number;
  sales: number;
  profit: number;
  quantity: number;
  items: AnalyticsOrder["items"];
};

const timeRangeLabels: Record<TimeRange, string> = {
  daily: "Daily",
  monthly: "Monthly",
  yearly: "Yearly",
};

const timeRangePeriods: Record<TimeRange, number> = {
  daily: 14,
  monthly: 12,
  yearly: 5,
};

const pieColours = [
  "#2563eb",
  "#7c3aed",
  "#0d9488",
  "#f97316",
  "#e11d48",
  "#0891b2",
  "#65a30d",
  "#64748b",
];

function bucketKey(date: Date, range: TimeRange) {
  if (range === "yearly") return String(date.getFullYear());
  if (range === "monthly") return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function bucketLabel(date: Date, range: TimeRange) {
  if (range === "yearly") return String(date.getFullYear());
  if (range === "monthly") return date.toLocaleDateString("en-US", { month: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function makeBuckets(range: TimeRange): ChartBucket[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const count = range === "monthly" ? today.getMonth() + 1 : timeRangePeriods[range];

  return Array.from({ length: count }, (_, index) => {
    const offset = count - index - 1;
    let date: Date;

    if (range === "daily") {
      date = new Date(today);
      date.setDate(today.getDate() - offset);
    } else if (range === "monthly") {
      date = new Date(today.getFullYear(), index, 1);
    } else {
      date = new Date(today.getFullYear() - offset, 0, 1);
    }

    return {
      key: bucketKey(date, range),
      label: bucketLabel(date, range),
      cost: 0,
      sales: 0,
      profit: 0,
      quantity: 0,
      items: [],
    };
  });
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export default function SalesAnalytics({ orders, products }: SalesAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [breakdown, setBreakdown] = useState<SalesBreakdown>("category-money");
  const [barVisibility, setBarVisibility] = useState<Record<BarMetric, boolean>>({ sales: true, cost: true, profit: true });
  const [hiddenPieLabels, setHiddenPieLabels] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const currency = useCurrency();
  const exchangeRate = useExchangeRate();
  const formatAmount = useCallback(
    (amount: number) => {
      if (currency === "LBP" && exchangeRate === null) return "LL …";
      return formatPrice(amount, currency, exchangeRate ?? 0);
    },
    [currency, exchangeRate],
  );

  const buckets = useMemo(() => {
    const values = makeBuckets(timeRange);
    const byKey = new Map(values.map((bucket) => [bucket.key, bucket]));

    for (const order of orders) {
      const bucket = byKey.get(bucketKey(new Date(order.orderedAt), timeRange));
      if (!bucket) continue;

      for (const item of order.items) {
        const sales = item.unitPrice * item.quantity;
        const cost = item.unitCost * item.quantity;
        bucket.sales += sales;
        bucket.cost += cost;
        bucket.profit += sales - cost;
        bucket.quantity += item.quantity;
        bucket.items.push(item);
      }
    }

    return values;
  }, [orders, timeRange]);

  const totals = useMemo(
    () =>
      buckets.reduce(
        (summary, bucket) => ({
          sales: summary.sales + bucket.sales,
          cost: summary.cost + bucket.cost,
          profit: summary.profit + bucket.profit,
          quantity: summary.quantity + bucket.quantity,
        }),
        { sales: 0, cost: 0, profit: 0, quantity: 0 },
      ),
    [buckets],
  );

  const productProfitability = useMemo(() => {
    const salesByProduct = new Map<string, { quantity: number; sales: number; cost: number; category: string }>();

    for (const bucket of buckets) {
      for (const item of bucket.items) {
        const key = item.productId || item.productName;
        const current = salesByProduct.get(key) ?? { quantity: 0, sales: 0, cost: 0, category: item.category ?? "Uncategorized" };
        current.quantity += item.quantity;
        current.sales += item.unitPrice * item.quantity;
        current.cost += item.unitCost * item.quantity;
        salesByProduct.set(key, current);
      }
    }

    return products.map((product) => {
      const stats = salesByProduct.get(product.id) ?? salesByProduct.get(product.name);
      const sales = stats?.sales ?? 0;
      const cost = stats?.cost ?? 0;
      const profit = sales - cost;

      return {
        id: product.id,
        sku: product.sku ?? "",
        name: product.name,
        category: product.category ?? stats?.category ?? "Uncategorized",
        unitsSold: stats?.quantity ?? 0,
        cost,
        sales,
        profit,
        profitMargin: sales > 0 ? (profit / sales) * 100 : 0,
      };
    });
  }, [buckets, products]);

  const productCategories = useMemo(
    () => ["ALL", ...Array.from(new Set(productProfitability.map((product) => product.category))).sort()],
    [productProfitability],
  );

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return productProfitability.filter((product) => {
      const matchesCategory = selectedCategory === "ALL" || product.category === selectedCategory;
      const matchesSearch = !query || [product.sku, product.name, product.category].some((value) => value.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [productProfitability, searchTerm, selectedCategory]);

  const barData = useMemo<ChartData<"bar">>(
    () => ({
      labels: buckets.map((bucket) => bucket.label),
      datasets: [
        {
          label: "Sales",
          data: buckets.map((bucket) => round(bucket.sales)),
          backgroundColor: "rgba(37, 99, 235, 0.82)",
          borderColor: "#2563eb",
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
          hidden: !barVisibility.sales,
        },
        {
          label: "Cost",
          data: buckets.map((bucket) => round(bucket.cost)),
          backgroundColor: "rgba(249, 115, 22, 0.78)",
          borderColor: "#f97316",
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
          hidden: !barVisibility.cost,
        },
        {
          label: "Profit",
          data: buckets.map((bucket) => round(bucket.profit)),
          backgroundColor: "rgba(16, 185, 129, 0.8)",
          borderColor: "#10b981",
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
          hidden: !barVisibility.profit,
        },
      ],
    }),
    [barVisibility, buckets],
  );

  const pieEntries = useMemo(() => {
    const useQuantity = breakdown.endsWith("quantity");
    const byCategory = breakdown.startsWith("category");
    const values = new Map<string, number>();

    for (const bucket of buckets) {
      for (const item of bucket.items) {
        const name = byCategory ? item.category?.trim() || "Uncategorized" : item.productName;
        const value = useQuantity ? item.quantity : item.unitPrice * item.quantity;
        values.set(name, (values.get(name) ?? 0) + value);
      }
    }

    const ranked = [...values.entries()].sort(([, first], [, second]) => second - first);
    const largest = ranked.slice(0, 7);
    const other = ranked.slice(7).reduce((sum, [, value]) => sum + value, 0);
    if (other > 0) largest.push(["Other", other]);

    return largest.map(([label, value], index) => ({
      id: label,
      label,
      value: round(value),
      color: pieColours[index % pieColours.length],
    }));
  }, [breakdown, buckets]);

  const pieData = useMemo<ChartData<"pie">>(() => {
    const visibleEntries = pieEntries.filter((entry) => !hiddenPieLabels.includes(entry.id));

    return {
      labels: visibleEntries.map((entry) => entry.label),
      datasets: [
        {
          data: visibleEntries.map((entry) => entry.value),
          backgroundColor: visibleEntries.map((entry) => entry.color),
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  }, [hiddenPieLabels, pieEntries]);

  const barOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<"bar">) => `${context.dataset.label ?? "Value"}: ${formatAmount(Number(context.parsed.y ?? 0))}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#64748b", maxRotation: 0 } },
        y: {
          beginAtZero: true,
          grid: { color: "#e2e8f0" },
          ticks: { color: "#64748b", callback: (value) => formatAmount(Number(value)) },
        },
      },
    }),
    [formatAmount],
  );

  const pieOptions = useMemo<ChartOptions<"pie">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<"pie">) => {
              const value = Number(context.parsed ?? 0);
              const total = context.dataset.data.reduce((sum, entry) => sum + Number(entry ?? 0), 0);
              const percentage = total ? (value / total) * 100 : 0;
              const displayValue = breakdown.endsWith("quantity")
                ? `${value.toLocaleString()} units`
                : formatAmount(value);
              return `${context.label ?? "Other"}: ${displayValue} (${percentage.toFixed(1)}%)`;
            },
          },
        },
      },
    }),
    [breakdown, formatAmount],
  );

  const hasData = totals.sales > 0 || totals.cost > 0 || totals.quantity > 0;
  const breakdownLabel = breakdown.startsWith("category") ? "category" : "item";
  const measureLabel = breakdown.endsWith("quantity") ? "quantity" : "revenue";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              <CalendarDays className="h-4 w-4" />
              Reporting period
            </div>
            <p className="mt-1 text-sm text-slate-500">All sales metrics and charts update together.</p>
          </div>
          <div className="inline-flex w-full rounded-xl bg-slate-100 p-1 sm:w-auto" role="group" aria-label="Time range">
            {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                  timeRange === range ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {timeRangeLabels[range]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total sales" value={formatAmount(totals.sales)} tone="blue" />
        <SummaryCard label="Total cost" value={formatAmount(totals.cost)} tone="orange" />
        <SummaryCard label="Gross profit" value={formatAmount(totals.profit)} tone="emerald" />
        <SummaryCard label="Items sold" value={totals.quantity.toLocaleString()} tone="violet" />
      </section>

      {hasData ? (
        <section className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-start gap-3">
              <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><BarChart3 className="h-5 w-5" /></span>
              <div>
                <h2 className="font-bold text-slate-900">Cost, sales &amp; profit</h2>
                <p className="mt-1 text-sm text-slate-500">Performance across the selected {timeRangeLabels[timeRange].toLowerCase()} period.</p>
                <ChartLegendButtons
                  ariaLabel="Toggle cost, sales, and profit metrics"
                  items={[
                    { id: "sales", label: "Sales", color: "#2563eb", active: barVisibility.sales },
                    { id: "cost", label: "Cost", color: "#f97316", active: barVisibility.cost },
                    { id: "profit", label: "Profit", color: "#10b981", active: barVisibility.profit },
                  ]}
                  onToggle={(id) => {
                    const metric = id as BarMetric;
                    setBarVisibility((current) => ({ ...current, [metric]: !current[metric] }));
                  }}
                />
              </div>
            </div>
            <div className="h-[340px]"><Bar data={barData} options={barOptions} aria-label="Cost, sales, and profit bar chart" /></div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between xl:block xl:space-y-4">
              <div>
                <h2 className="font-bold text-slate-900">Sales breakdown</h2>
                <p className="mt-1 text-sm text-slate-500">Share of {measureLabel} by {breakdownLabel}.</p>
                <ChartLegendButtons
                  ariaLabel="Toggle sales breakdown segments"
                  items={pieEntries.map(({ id, label, color }) => ({
                    id,
                    label,
                    color,
                    active: !hiddenPieLabels.includes(id),
                  }))}
                  onToggle={(id) => {
                    setHiddenPieLabels((current) => current.includes(id) ? current.filter((label) => label !== id) : [...current, id]);
                  }}
                />
              </div>
              <label className="sr-only" htmlFor="sales-breakdown">Sales breakdown</label>
              <select
                id="sales-breakdown"
                value={breakdown}
                onChange={(event) => {
                  setBreakdown(event.target.value as SalesBreakdown);
                  setHiddenPieLabels([]);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 xl:w-full"
              >
                <option value="category-money">Sales by category — money</option>
                <option value="category-quantity">Sales by category — quantity</option>
                <option value="item-money">Sales by item — money</option>
                <option value="item-quantity">Sales by item — quantity</option>
              </select>
            </div>
            <div className="h-[340px]"><Pie data={pieData} options={pieOptions} aria-label="Sales breakdown pie chart" /></div>
          </article>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <PackageOpen className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 font-bold text-slate-900">No completed sales for this period</h2>
          <p className="mt-2 text-sm text-slate-500">Completed customer orders will appear here automatically.</p>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Product profitability</h2>
            <p className="mt-1 text-sm text-slate-500">Compare sales, cost, and margin for the selected {timeRangeLabels[timeRange].toLowerCase()} period.</p>
          </div>
          <div className="w-full lg:max-w-sm">
            <label className="sr-only" htmlFor="product-profit-search">Search products</label>
            <input
              id="product-profit-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search SKU, product, or category..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter products by category">
          {productCategories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === category ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {category === "ALL" ? "All categories" : category}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3" scope="col">SKU</th>
                <th className="px-4 py-3" scope="col">Product</th>
                <th className="px-4 py-3" scope="col">Category</th>
                <th className="px-4 py-3 text-right" scope="col">Sold</th>
                <th className="px-4 py-3 text-right" scope="col">Cost</th>
                <th className="px-4 py-3 text-right" scope="col">Sales</th>
                <th className="px-4 py-3 text-right" scope="col">Profit</th>
                <th className="px-4 py-3 text-right" scope="col">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="transition hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">{product.sku || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{product.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{product.category}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">{product.unitsSold.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">{formatAmount(product.cost)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-900">{formatAmount(product.sales)}</td>
                    <td className={`whitespace-nowrap px-4 py-3 text-right font-medium ${product.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatAmount(product.profit)}</td>
                    <td className={`whitespace-nowrap px-4 py-3 text-right font-medium ${product.profitMargin >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{product.profitMargin.toFixed(1)}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">No products match the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: "blue" | "orange" | "emerald" | "violet" }) {
  const tones = {
    blue: "sales-summary-card--blue border-blue-100 bg-blue-50 text-blue-700",
    orange: "sales-summary-card--orange border-orange-100 bg-orange-50 text-orange-700",
    emerald: "sales-summary-card--emerald border-emerald-100 bg-emerald-50 text-emerald-700",
    violet: "sales-summary-card--violet border-violet-100 bg-violet-50 text-violet-700",
  };

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${tones[tone]}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </article>
  );
}

type ChartLegendButton = {
  id: string;
  label: string;
  color: string;
  active: boolean;
};

function ChartLegendButtons({
  ariaLabel,
  items,
  onToggle,
}: {
  ariaLabel: string;
  items: ChartLegendButton[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-slate-500">Click a label to show or hide it.</p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.active}
            title={`${item.active ? "Hide" : "Show"} ${item.label}`}
            onClick={() => onToggle(item.id)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              item.active
                ? "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50"
                : "border-slate-200 bg-slate-50 text-slate-400 opacity-70 line-through hover:border-slate-300 hover:bg-slate-100"
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${item.active ? "" : "opacity-40"}`}
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
