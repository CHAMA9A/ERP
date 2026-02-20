import jsPDF from "jspdf";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PdfClient {
  companyName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  address?: string | null;
  phone?: string | null;
}

export interface PdfQuoteItem {
  quantity: number | string;
  productRef?: string | null;
  description?: string | null;
  unitPrice: number | string;
  totalPrice?: number | string | null;
}

export interface PdfQuote {
  quoteNumber: string;
  date?: string | null;
  customerReference?: string | null;
  salesPerson?: string | null;
  deliveryDelay?: string | null;
  shippingPoint?: string | null;
  shippingTerms?: string | null;
  comments?: string | null;
  remarks?: string | null;
  tvaRate?: number | string | null;
  totalHt?: number | string | null;
  totalTva?: number | string | null;
  totalTtc?: number | string | null;
  client?: PdfClient | null;
  items?: PdfQuoteItem[];
}

export interface PdfCompanySettings {
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  siren?: string | null;
  tvaNumber?: string | null;
  paymentMethod?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtEur(n: number | string | null | undefined): string {
  const v = parseFloat(String(n ?? 0));
  if (isNaN(v)) return "0,00€";
  // Format manually to avoid locale-specific non-breaking spaces that break jsPDF rendering
  const fixed = v.toFixed(2); // e.g. "3500.00"
  const [intPart, decPart] = fixed.split(".");
  // Add dot as thousands separator (French style: space, but use plain space for jsPDF)
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${intFormatted},${decPart}€`;
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return new Date().toLocaleDateString("fr-FR");
  try {
    return new Date(d).toLocaleDateString("fr-FR");
  } catch {
    return new Date().toLocaleDateString("fr-FR");
  }
}

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ─── Plain bordered table (no color, like the image) ─────────────────────────

interface ColDef {
  header: string;
  width: number;
  align?: "left" | "right" | "center";
  bold?: boolean;
}

function drawPlainTable(
  doc: jsPDF,
  startX: number,
  startY: number,
  cols: ColDef[],
  rows: string[][],
  rowHeight = 7
): number {
  const black: [number, number, number] = [0, 0, 0];
  const lightBorder: [number, number, number] = [180, 180, 180];
  const totalW = cols.reduce((s, c) => s + c.width, 0);

  let y = startY;

  // ── Header row background (light grey fill)
  doc.setFillColor(240, 240, 240);
  doc.rect(startX, y, totalW, rowHeight, "F");

  // Header text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...black);

  let cx = startX;
  for (const col of cols) {
    const tx =
      col.align === "right"
        ? cx + col.width - 2
        : col.align === "center"
        ? cx + col.width / 2
        : cx + 2;
    doc.text(col.header, tx, y + rowHeight - 2, {
      align: col.align === "right" ? "right" : col.align === "center" ? "center" : "left",
    });
    cx += col.width;
  }
  y += rowHeight;

  // ── Data rows
  for (let ri = 0; ri < rows.length; ri++) {
    const row = rows[ri];

    // white background
    doc.setFillColor(255, 255, 255);
    doc.rect(startX, y, totalW, rowHeight, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...black);

    let ccx = startX;
    for (let ci = 0; ci < cols.length; ci++) {
      const col = cols[ci];
      const cellText = String(row[ci] ?? "");
      const clipped = doc.splitTextToSize(cellText, col.width - 4)[0] ?? "";
      const tx =
        col.align === "right"
          ? ccx + col.width - 2
          : col.align === "center"
          ? ccx + col.width / 2
          : ccx + 2;
      if (col.bold) doc.setFont("helvetica", "bold");
      else doc.setFont("helvetica", "normal");
      doc.text(clipped, tx, y + rowHeight - 2, {
        align: col.align === "right" ? "right" : col.align === "center" ? "center" : "left",
      });
      ccx += col.width;
    }

    // row bottom border
    doc.setDrawColor(...lightBorder);
    doc.setLineWidth(0.2);
    doc.line(startX, y + rowHeight, startX + totalW, y + rowHeight);

    y += rowHeight;
  }

  // Outer border
  doc.setDrawColor(...lightBorder);
  doc.setLineWidth(0.4);
  doc.rect(startX, startY, totalW, y - startY, "S");

  return y;
}

// ─── Main generator ──────────────────────────────────────────────────────────

export async function generateQuotePDF(
  quote: PdfQuote,
  settings: PdfCompanySettings = {}
): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;

  const black: [number, number, number] = [0, 0, 0];
  const darkGrey: [number, number, number] = [60, 60, 60];
  const midGrey: [number, number, number] = [120, 120, 120];
  const lightBorder: [number, number, number] = [180, 180, 180];

  // ── Client info
  const client = quote.client ?? {};
  const rawName = `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim();
  const clientName = client.companyName || rawName || "—";
  const clientAddress = client.address ?? "";
  const clientContact = rawName;
  const clientPhone = client.phone ?? "";

  // ── Company info
  const companyName = settings.name ?? "T-LINK NETWORK OPERATEUR";
  const companyAddress = settings.address ?? "6 Bd des Monts d'Or, 69580 Sathonay camp";
  const companyPhone = settings.phone ?? "Tél 04 26 78 75 35";
  const siren = settings.siren ?? "";
  const tvaNumber = settings.tvaNumber ?? "";

  // ── Totals
  const tvaRate = parseFloat(String(quote.tvaRate ?? 20)) || 20;
  const items = quote.items ?? [];
  const computedHT = items.reduce(
    (s, i) =>
      s + (parseFloat(String(i.quantity)) || 0) * (parseFloat(String(i.unitPrice)) || 0),
    0
  );
  const totalHT = parseFloat(String(quote.totalHt ?? 0)) || computedHT;
  const totalTVA =
    parseFloat(String(quote.totalTva ?? 0)) || totalHT * (tvaRate / 100);
  const totalTTC =
    parseFloat(String(quote.totalTtc ?? 0)) || totalHT + totalTVA;

  let y = margin;

  // ══════════════════════════════════════════════════════════════
  // SECTION 1 — HEADER : logo (left) + delivery address box (right)
  // ══════════════════════════════════════════════════════════════

  // --- Logo
  const logoUrl =
    settings.logoUrl ??
    "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/3771e944-925f-4b77-b472-1f86fadc22de/tlink-network-operateur-resized-1771506429087.webp?width=400&height=200&resize=contain";

  const logoBase64 = await loadImageAsBase64(logoUrl);
  if (logoBase64) {
    doc.addImage(logoBase64, "WEBP", margin, y, 40, 15);
  }

  // Company info below logo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...darkGrey);
  doc.text(companyName, margin, y + 20);
  doc.text(companyAddress, margin, y + 25);
  doc.text(companyPhone, margin, y + 30);

  // --- Delivery address box (top right)
  const boxW = 78;
  const boxX = pageW - margin - boxW;
  const boxStartY = y;

  // Parse address lines
  const addrLines = doc.splitTextToSize(clientAddress, boxW - 10);

  // Calculate box height
  const boxContentH =
    6 + // "Adresse de livraison :" header row
    7 + // company name bold
    addrLines.length * 4.5 +
    (clientContact ? 5 : 0) +
    (clientPhone ? 5 : 0) +
    4;

  // Draw box border
  doc.setDrawColor(...lightBorder);
  doc.setLineWidth(0.5);
  doc.rect(boxX, boxStartY, boxW, boxContentH, "S");

  // "Adresse de livraison :" label — small grey text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...midGrey);
  doc.text("Adresse de livraison :", boxX + 3, boxStartY + 5);

  // Company name bold inside box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...black);
  doc.text(clientName, boxX + 3, boxStartY + 11);

  // Address lines
  let lineY = boxStartY + 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...darkGrey);
  for (const line of addrLines) {
    doc.text(line, boxX + 3, lineY);
    lineY += 4.5;
  }

  // Client block BELOW the box on the right
  let clientBelowY = boxStartY + boxContentH + 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...black);
  doc.text(clientName, boxX, clientBelowY);
  clientBelowY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...darkGrey);
  for (const line of addrLines) {
    doc.text(line, boxX, clientBelowY);
    clientBelowY += 4.5;
  }
  clientBelowY += 2;
  if (clientContact) {
    doc.text(`A l'attention de ${clientContact}`, boxX, clientBelowY);
    clientBelowY += 4.5;
  }
  if (clientPhone) {
    doc.text(`Tél : ${clientPhone}`, boxX, clientBelowY);
    clientBelowY += 4.5;
  }

  // Move y past the taller of the two columns
  y = Math.max(y + 32, clientBelowY) + 6;

  // ══════════════════════════════════════════════════════════════
  // SECTION 2 — "Devis" title
  // ══════════════════════════════════════════════════════════════
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...black);
  doc.text("Devis", margin, y);
  y += 8;

  // ══════════════════════════════════════════════════════════════
  // SECTION 3 — Summary table (Date / Numéro pièce / Client / Votre référence / Commercial)
  // ══════════════════════════════════════════════════════════════
  const summaryW = pageW - margin * 2;
  const col5 = summaryW / 5;

  y = drawPlainTable(
    doc,
    margin,
    y,
    [
      { header: "Date", width: col5 },
      { header: "Numéro pièce", width: col5 },
      { header: "Client", width: col5 },
      { header: "Votre référence", width: col5 },
      { header: "Commercial", width: col5 },
    ],
    [
      [
        fmtDate(quote.date),
        quote.quoteNumber,
        clientName,
        quote.customerReference ?? "",
        quote.salesPerson ?? "",
      ],
    ],
    7
  );

  y += 8;

  // ══════════════════════════════════════════════════════════════
  // SECTION 4 — Comments (italic grey, left)
  // ══════════════════════════════════════════════════════════════
  if (quote.comments?.trim()) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...midGrey);
    const commentLines = doc.splitTextToSize(
      quote.comments.trim(),
      (pageW - margin * 2) / 2
    );
    doc.text(commentLines, margin, y);
    y += commentLines.length * 4.5 + 4;
  }

  // ══════════════════════════════════════════════════════════════
  // SECTION 5 — Items table
  // ══════════════════════════════════════════════════════════════
  const tableW = pageW - margin * 2;
  const colQty = 18;
  const colRef = 32;
  const colPU = 38;
  const colTotal = 38;
  const colDesc = tableW - colQty - colRef - colPU - colTotal;

  const itemRows: string[][] = items.map((item) => {
    const qty = parseFloat(String(item.quantity)) || 0;
    const pu = parseFloat(String(item.unitPrice)) || 0;
    return [
      String(qty),
      item.productRef ?? "",
      item.description ?? "",
      fmtEur(pu),
      fmtEur(qty * pu),
    ];
  });

  if (itemRows.length === 0) {
    itemRows.push(["", "", "Aucun article", "", ""]);
  }

  y = drawPlainTable(
    doc,
    margin,
    y,
    [
      { header: "Quantité", width: colQty, align: "center" },
      { header: "Référence", width: colRef },
      { header: "Article", width: colDesc },
      { header: "Prix net unitaire", width: colPU, align: "right" },
      { header: "Montant total", width: colTotal, align: "right" },
    ],
    itemRows,
    7
  );

  y += 8;

  // ══════════════════════════════════════════════════════════════
  // SECTION 6 — Remarks (left) + Totals (right) side by side
  // ══════════════════════════════════════════════════════════════

  // Comments / remarks on the left (italic)
  if (quote.remarks?.trim()) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...midGrey);
    const remarkLines = doc.splitTextToSize(quote.remarks.trim(), pageW / 2 - margin - 4);
    doc.text(remarkLines, margin, y + 5);
  }

  // Totals block (right side)
  const totW = 80;
  const totX = pageW - margin - totW;
  let ty = y;

  const drawTotRow = (label: string, value: string, bold = false) => {
    if (bold) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
    }
    doc.setTextColor(...black);
    doc.text(label, totX, ty + 4.5);
    doc.text(value, pageW - margin, ty + 4.5, { align: "right" });
    ty += 6;
  };

  drawTotRow("Sous-total HT", fmtEur(totalHT));
  drawTotRow(`Total de taxes (${tvaRate} %)`, fmtEur(totalTVA));

  // Separator before TTC
  doc.setDrawColor(...lightBorder);
  doc.setLineWidth(0.3);
  doc.line(totX, ty, pageW - margin, ty);

  drawTotRow("Total TTC", fmtEur(totalTTC), true);

  // ══════════════════════════════════════════════════════════════
  // SECTION 7 — Payment info (two rows, grey cell on right)
  // ══════════════════════════════════════════════════════════════
  const payY = ty + 8;
  const payRowH = 7;
  const payLabelW = 42;
  const payValueW = totW - payLabelW;

  const payRows: [string, string][] = [];
  if (settings.paymentMethod) payRows.push(["Méthode de paiement", settings.paymentMethod]);
  if (quote.deliveryDelay) payRows.push(["Délai de paiement", quote.deliveryDelay]);

  if (payRows.length > 0) {
    let py = payY;
    for (const [label, value] of payRows) {
      // Label (bold, left)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...black);
      doc.text(label, margin, py + payRowH - 2);

      // Value box (grey fill, right-aligned text)
      doc.setFillColor(240, 240, 240);
      doc.rect(margin + payLabelW, py, payValueW + 50, payRowH, "F");
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...darkGrey);
      doc.text(value, margin + payLabelW + payValueW + 50 - 2, py + payRowH - 2, {
        align: "right",
      });

      py += payRowH + 1;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════════════════════
  const footerY = pageH - 8;

  doc.setDrawColor(...lightBorder);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, pageW - margin, footerY - 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...midGrey);

  doc.text("1 / 1", margin, footerY);

  const footerParts: string[] = [companyName, companyAddress];
  if (siren) footerParts.push(`Siren - ${siren}`);
  if (tvaNumber) footerParts.push(`N° Identification CEE ${tvaNumber}`);
  doc.text(footerParts.join("  -  "), pageW / 2, footerY, { align: "center" });

  return doc;
}
