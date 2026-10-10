import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import type { SerializedOrder } from "@/lib/orders";
import { orderStateLabels, paymentStateLabels } from "@/lib/order-state";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });

export function createOrderReceipt(order: SerializedOrder, usdToLbp: number) {
  if (!Number.isFinite(usdToLbp) || usdToLbp <= 0) {
    throw new Error("A valid exchange rate is required to generate the receipt.");
  }
  const lbp = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  const prices = (amount: number) => `${money.format(amount)}\nLL ${lbp.format(amount * usdToLbp)}`;
  const doc = new jsPDF();
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 42, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text("SouqFlow", 14, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("ORDER RECEIPT", 14, 30);
  doc.text(date.format(new Date(order.orderedAt)), 196, 20, { align: "right" });
  doc.setTextColor(30, 41, 59);

  autoTable(doc, {
    startY: 49,
    theme: "plain",
    body: [
      ["Order", order.orderNumber],
      ["Customer", order.customerName || "Guest"],
      ...(order.customerPhone ? [["Phone", order.customerPhone]] : []),
      ...(order.customerAddress ? [["Address", order.customerAddress]] : []),
      ["Ordered at", date.format(new Date(order.orderedAt))],
      ["Payment state", paymentStateLabels[order.paymentStatus]],
      ["Delivery state", orderStateLabels[order.status]],
    ],
    columnStyles: { 0: { cellWidth: 35, fontStyle: "bold" } },
    styles: { fontSize: 10, cellPadding: 3, overflow: "linebreak", textColor: [51, 65, 85] },
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
    headStyles: { fillColor: [79, 70, 229], cellPadding: 4 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    footStyles: { fillColor: [238, 242, 255], textColor: [49, 46, 129], fontStyle: "bold", cellPadding: 5 },
    styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak", textColor: [51, 65, 85] },
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
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 276, 196, 276);
    doc.text(`Exchange rate: USD 1 = LL ${lbp.format(usdToLbp)}`, 14, 282);
    doc.text("Thank you for your order.", 14, 288);
    doc.text(`Page ${page} of ${pages}`, 196, 287, { align: "right" });
  }
  return doc;
}
