"use client";

import { useMemo, useState } from "react";
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
import { formatPrice, useCurrency } from "../currency";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

type TimeRange = "daily" | "monthly" | "yearly";
type SalesBreakdown = "category-money" | "category-quantity" | "item-money" | "item-quantity";

type AnalyticsOrder = {
  id: string;
  orderedAt: string;
  items: Array<{
    category: string | null;
    productName: string;
    quantity: number;
    unitCost: number;
    unitPrice: number;
  }>;
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
  if (range === "monthly") return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function makeBuckets(range: TimeRange): ChartBucket[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const count = timeRangePeriods[range];

  return Array.from({ length: count }, (_, index) => {
    const offset = count - index - 1;
    let date: Date;

    if (range === "daily") {
      date = new Date(today);
      date.setDate(today.getDate() - offset);
    } else if (range === "monthly") {
      date = new Date(today.getFullYear(), today.getMonth() - offset, 1);
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

export default function SalesAnalytics({ orders }: { orders: AnalyticsOrder[] }) {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [breakdown, setBreakdown] = useState<SalesBreakdown>("category-money");
  const currency = useCurrency();

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
        },
        {
          label: "Cost",
          data: buckets.map((bucket) => round(bucket.cost)),
          backgroundColor: "rgba(249, 115, 22, 0.78)",
          borderColor: "#f97316",
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: "Profit",
          data: buckets.map((bucket) => round(bucket.profit)),
          backgroundColor: "rgba(16, 185, 129, 0.8)",
          borderColor: "#10b981",
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    }),
    [buckets],
  );

  const pieData = useMemo<ChartData<"pie">>(() => {
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

    return {
      labels: largest.map(([label]) => label),
      datasets: [
        {
          data: largest.map(([, value]) => round(value)),
          backgroundColor: largest.map((_, index) => pieColours[index % pieColours.length]),
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  }, [breakdown, buckets]);

  const barOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "top", align: "end", labels: { usePointStyle: true, boxWidth: 8, padding: 18 } },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<"bar">) => `${context.dataset.label ?? "Value"}: ${formatPrice(Number(context.parsed.y ?? 0), currency)}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#64748b", maxRotation: 0 } },
        y: {
          beginAtZero: true,
          grid: { color: "#e2e8f0" },
          ticks: { color: "#64748b", callback: (value) => formatPrice(Number(value), currency) },
        },
      },
    }),
    [currency],
  );

  const pieOptions = useMemo<ChartOptions<"pie">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, padding: 16 } },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<"pie">) => {
              const value = Number(context.parsed ?? 0);
              const total = context.dataset.data.reduce((sum, entry) => sum + Number(entry ?? 0), 0);
              const percentage = total ? (value / total) * 100 : 0;
              const displayValue = breakdown.endsWith("quantity")
                ? `${value.toLocaleString()} units`
                : formatPrice(value, currency);
              return `${context.label ?? "Other"}: ${displayValue} (${percentage.toFixed(1)}%)`;
            },
          },
        },
      },
    }),
    [breakdown, currency],
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
        <SummaryCard label="Total sales" value={formatPrice(totals.sales, currency)} tone="blue" />
        <SummaryCard label="Total cost" value={formatPrice(totals.cost, currency)} tone="orange" />
        <SummaryCard label="Gross profit" value={formatPrice(totals.profit, currency)} tone="emerald" />
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
              </div>
            </div>
            <div className="h-[340px]"><Bar data={barData} options={barOptions} aria-label="Cost, sales, and profit bar chart" /></div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between xl:block xl:space-y-4">
              <div>
                <h2 className="font-bold text-slate-900">Sales breakdown</h2>
                <p className="mt-1 text-sm text-slate-500">Share of {measureLabel} by {breakdownLabel}.</p>
              </div>
              <label className="sr-only" htmlFor="sales-breakdown">Sales breakdown</label>
              <select
                id="sales-breakdown"
                value={breakdown}
                onChange={(event) => setBreakdown(event.target.value as SalesBreakdown)}
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
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: "blue" | "orange" | "emerald" | "violet" }) {
  const tones = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    orange: "border-orange-100 bg-orange-50 text-orange-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    violet: "border-violet-100 bg-violet-50 text-violet-700",
  };

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${tones[tone]}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </article>
  );
}
