import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import type { SerializedOrder } from "@/lib/orders";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });

type ReceiptLogo = { dataUrl: string; width: number; height: number };

export async function loadReceiptLogo(src: string): Promise<ReceiptLogo> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  const loaded = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Unable to load the business logo. Please try again."));
  });
  image.src = src;
  await loaded;
  const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to prepare the business logo for the receipt.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { dataUrl: canvas.toDataURL("image/png"), width: canvas.width, height: canvas.height };
}

export function createOrderReceipt(order: SerializedOrder, usdToLbp: number, businessName: string, logo?: ReceiptLogo) {
  if (!Number.isFinite(usdToLbp) || usdToLbp <= 0) {
    throw new Error("A valid exchange rate is required to generate the receipt.");
  }
  const lbp = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  const prices = (amount: number) => `${money.format(amount)}\nLL ${lbp.format(amount * usdToLbp)}`;
  const doc = new jsPDF();
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 42, "F");
  if (logo) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 8, 26, 26, 2, 2, "F");
    const scale = 22 / Math.max(logo.width, logo.height);
    const width = logo.width * scale;
    const height = logo.height * scale;
    doc.addImage(logo.dataUrl, "PNG", 16 + (22 - width) / 2, 10 + (22 - height) / 2, width, height);
  }
  const textX = logo ? 46 : 14;
  const maxNameWidth = 149 - textX;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  const receiptName = businessName.trim() || "Order receipt";
  const nameWidth = doc.getTextWidth(receiptName);
  if (nameWidth > maxNameWidth) doc.setFontSize(24 * maxNameWidth / nameWidth);
  doc.text(receiptName, textX, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("ORDER RECEIPT", textX, 30);
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
    ],
    columnStyles: { 0: { cellWidth: 35, fontStyle: "bold" } },
    styles: { fontSize: 10, cellPadding: 3, overflow: "linebreak", textColor: [51, 65, 85] },
    margin: { bottom: 28 },
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
    margin: { bottom: 28 },
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
    doc.text(`© ${new Date().getFullYear()}. All rights reserved.`, 14, 293);
    const credit = "Powered by SouqFlow";
    doc.setTextColor(79, 70, 229);
    doc.textWithLink(credit, 196 - doc.getTextWidth(credit), 293, {
      url: "https://tech-talk-souq-flow.vercel.app/",
    });
  }
  return doc;
}
