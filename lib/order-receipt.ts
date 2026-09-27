import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import type { SerializedOrder } from "@/lib/orders";
import { orderStateLabels } from "@/lib/order-state";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });

export function createOrderReceipt(order: SerializedOrder, usdToLbp: number) {
  if (!Number.isFinite(usdToLbp) || usdToLbp <= 0) {
    throw new Error("A valid exchange rate is required to generate the receipt.");
  }
  const lbp = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  const prices = (amount: number) => `${money.format(amount)}\nLL ${lbp.format(amount * usdToLbp)}`;
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.setTextColor(29, 78, 216);
  doc.text("SouqFlow | Receipt", 14, 22);

  autoTable(doc, {
    startY: 30,
    theme: "plain",
    body: [
      ["Order", order.orderNumber],
      ["Customer", order.customerName || "Guest"],
      ["Ordered at", date.format(new Date(order.orderedAt))],
      ["Order status", orderStateLabels[order.status]],
    ],
    columnStyles: { 0: { cellWidth: 35, fontStyle: "bold" } },
    styles: { fontSize: 10, cellPadding: 3, overflow: "linebreak" },
  });

  const total = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  autoTable(doc, {
    head: [["Item", "Quantity", "Unit price", "Amount"]],
    body: order.items.length
      ? order.items.map((item) => [item.productName, item.quantity, prices(item.unitPrice), prices(item.quantity * item.unitPrice)])
      : [[{ content: "No items", colSpan: 4 }]],
    foot: [[{ content: "Total", colSpan: 3 }, prices(total)]],
    showFoot: "lastPage",
    theme: "striped",
    headStyles: { fillColor: [29, 78, 216] },
    footStyles: { fillColor: [239, 246, 255], textColor: [30, 58, 138] },
    styles: { fontSize: 10, cellPadding: 3, overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    margin: { bottom: 20 },
  });

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Page ${page} of ${pages}`, 196, 287, { align: "right" });
  }
  return doc;
}
