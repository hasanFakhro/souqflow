"use client";

import { useMemo, useState } from "react";

type OrderItem = {
  productId?: string | null;
  category: string;
  productName: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
};

type Order = {
  id: string;
  orderedAt: string;
  items: OrderItem[];
};

type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  costPrice: number;
  sellPrice: number;
};

type Props = {
  orders: Order[];
  products: Product[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function SalesAnalytics({ orders, products }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // --- Task 1: Top-level KPI Aggregations ---
  const kpis = useMemo(() => {
    let totalSales = 0;
    let totalCost = 0;
    let itemsSold = 0;

    for (const order of orders) {
      for (const item of order.items) {
        totalSales += item.unitPrice * item.quantity;
        totalCost += item.unitCost * item.quantity;
        itemsSold += item.quantity;
      }
    }

    const grossProfit = totalSales - totalCost;
    return { totalSales, totalCost, grossProfit, itemsSold };
  }, [orders]);

  // --- Task 2: Product Profitability Table Data ---
  const productProfitability = useMemo(() => {
    // 1. Group sales by product identifier (ID or Fallback to Name)
    const salesMap = new Map<
      string,
      { quantity: number; sales: number; cost: number; category: string }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        const key = item.productId || item.productName;
        const current = salesMap.get(key) || {
          quantity: 0,
          sales: 0,
          cost: 0,
          category: item.category,
        };

        current.quantity += item.quantity;
        current.sales += item.unitPrice * item.quantity;
        current.cost += item.unitCost * item.quantity;
        salesMap.set(key, current);
      }
    }

    // 2. Map all catalog products to metrics
    return products.map((product) => {
      const stats = salesMap.get(product.id) || salesMap.get(product.name);
      const unitsSold = stats?.quantity || 0;
      const sales = stats?.sales || 0;
      const cost = stats?.cost || 0;
      const profit = sales - cost;
      const profitMargin = sales > 0 ? (profit / sales) * 100 : 0;

      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        category: product.category || stats?.category || "Uncategorized",
        unitsSold,
        cost,
        sales,
        profit,
        profitMargin,
      };
    });
  }, [orders, products]);

  // Extract distinct categories for Task 3 navigation
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return ["ALL", ...Array.from(set).sort()];
  }, [products]);

  // --- Task 3: Filtering & Search Logic ---
  const filteredProducts = useMemo(() => {
    return productProfitability.filter((item) => {
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;
      const cleanQuery = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !cleanQuery ||
        item.name.toLowerCase().includes(cleanQuery) ||
        item.sku.toLowerCase().includes(cleanQuery) ||
        item.category.toLowerCase().includes(cleanQuery);

      return matchesCategory && matchesSearch;
    });
  }, [productProfitability, selectedCategory, searchTerm]);

  return (
    <div className="space-y-8">
      {/* 4 Existing KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Sales
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(kpis.totalSales)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Cost
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(kpis.totalCost)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Gross Profit
          </p>
          <p
            className={`mt-2 text-2xl font-bold ${
              kpis.grossProfit >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {formatCurrency(kpis.grossProfit)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Items Sold
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {kpis.itemsSold.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Task 3: Search Bar + Category Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-xs">
            <label htmlFor="search" className="sr-only">
              Search products
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by SKU, name, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Category Navigation Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {category === "ALL" ? "All Categories" : category}
              </button>
            ))}
          </div>
        </div>

        {/* Task 2: Product Profitability Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead>
              <tr className="bg-slate-50 font-semibold text-slate-600">
                <th scope="col" className="px-4 py-3">SKU</th>
                <th scope="col" className="px-4 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-4 py-3 text-right">Units Sold</th>
                <th scope="col" className="px-4 py-3 text-right">Cost</th>
                <th scope="col" className="px-4 py-3 text-right">Sales</th>
                <th scope="col" className="px-4 py-3 text-right">Profit</th>
                <th scope="col" className="px-4 py-3 text-right">Profit Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                      {p.sku || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                      {p.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {p.category}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                      {p.unitsSold.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                      {formatCurrency(p.cost)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-900 font-medium">
                      {formatCurrency(p.sales)}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right font-medium ${
                        p.profit >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {formatCurrency(p.profit)}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right font-medium ${
                        p.profitMargin >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {p.sales > 0 ? `${p.profitMargin.toFixed(1)}%` : "0.0%"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}"use client";

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
