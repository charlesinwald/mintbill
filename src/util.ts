import jsPDF from "jspdf";
import "jspdf-autotable";
import { UserOptions } from "jspdf-autotable";

// Add this interface to extend jsPDF
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => void;
}

export function generatePdf(invoiceData: any) {
  const doc = new jsPDF() as jsPDFWithAutoTable;

  // --- General Settings ---
  const leftMargin = 20;
  let currentY = 20;

  // Use a nicer, smaller font for body text.
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  // Optionally, add a line or rectangle under the header.
  // doc.setDrawColor(170);
  // doc.setLineWidth(0.5);
  // doc.line(leftMargin, currentY + 10, 200, currentY + 10);

  // --- Title (centered) ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("INVOICE", doc.internal.pageSize.getWidth() / 2, currentY, {
    align: "center",
  });

  // --- Invoice Details ---
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  currentY += 15;

  doc.text(
    `Invoice Number: ${invoiceData.invoiceNumber || "N/A"}`,
    leftMargin,
    currentY
  );
  currentY += 6;
  doc.text(
    `Issue Date: ${invoiceData.issueDate || "N/A"}`,
    leftMargin,
    currentY
  );
  currentY += 6;
  doc.text(`Due Date: ${invoiceData.dueDate || "N/A"}`, leftMargin, currentY);

  // --- Horizontal Separator ---
  currentY += 10;
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  doc.line(leftMargin, currentY, 190, currentY);
  currentY += 10;

  // --- Seller (From) Information ---
  doc.setFont("helvetica", "bold");
  doc.text("From:", leftMargin, currentY);
  doc.setFont("helvetica", "normal");
  currentY += 6;
  doc.text(invoiceData.sellerCompanyName || "N/A", leftMargin, currentY);
  currentY += 6;
  doc.text(invoiceData.sellerStreet || "N/A", leftMargin, currentY);
  currentY += 6;
  doc.text(
    `${invoiceData.sellerCity || ""}, ${invoiceData.sellerState || ""} ${
      invoiceData.sellerZipCode || ""
    }`,
    leftMargin,
    currentY
  );
  currentY += 6;
  doc.text(invoiceData.sellerCountry || "N/A", leftMargin, currentY);
  currentY += 6;
  doc.text(`Phone: ${invoiceData.sellerPhone || "N/A"}`, leftMargin, currentY);
  currentY += 6;
  doc.text(`Email: ${invoiceData.sellerEmail || "N/A"}`, leftMargin, currentY);

  // --- Buyer (To) Information ---
  currentY += 10;
  doc.setFont("helvetica", "bold");
  doc.text("To:", leftMargin, currentY);
  doc.setFont("helvetica", "normal");
  currentY += 6;
  doc.text(invoiceData.buyerName || "N/A", leftMargin, currentY);
  currentY += 6;
  doc.text(invoiceData.buyerStreet || "N/A", leftMargin, currentY);
  currentY += 6;
  doc.text(
    `${invoiceData.buyerCity || ""}, ${invoiceData.buyerState || ""} ${
      invoiceData.buyerZipCode || ""
    }`,
    leftMargin,
    currentY
  );
  currentY += 6;
  doc.text(invoiceData.buyerCountry || "N/A", leftMargin, currentY);
  currentY += 6;
  doc.text(`Phone: ${invoiceData.buyerPhone || "N/A"}`, leftMargin, currentY);
  currentY += 6;
  doc.text(`Email: ${invoiceData.buyerEmail || "N/A"}`, leftMargin, currentY);

  // --- Items Table ---
  currentY += 10;
  const items = invoiceData.items || [];
  const tableColumns = ["Item", "Quantity", "Price", "Total"];
  const tableRows = items.map((item: any) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return [
      item.description || "N/A",
      String(qty),
      `$${price.toFixed(2)}`,
      `$${(price * qty).toFixed(2)}`,
    ];
  });

  doc.autoTable({
    startY: currentY,
    head: [tableColumns],
    body: tableRows,
    margin: { left: leftMargin },
    theme: "grid",
    headStyles: { fillColor: [60, 141, 188] }, // optional: a nicer blue heading
    styles: { halign: "left" },
  });

  // Calculate new Y after autoTable
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // --- Total Amount ---
  const total = items.reduce((sum: number, item: any) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return sum + price * qty;
  }, 0);

  doc.setFont("helvetica", "bold");
  doc.text(`Total Amount: $${total.toFixed(2)}`, 180, currentY, {
    align: "right",
  });
  doc.setFont("helvetica", "normal");

  // --- Notes ---
  if (invoiceData.notes) {
    currentY += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", leftMargin, currentY);
    doc.setFont("helvetica", "normal");
    currentY += 6;
    doc.text(invoiceData.notes, leftMargin, currentY);
  }

  // --- Terms & Conditions ---
  if (invoiceData.termsAndConditions) {
    currentY += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Terms and Conditions:", leftMargin, currentY);
    doc.setFont("helvetica", "normal");
    currentY += 6;
    doc.text(invoiceData.termsAndConditions, leftMargin, currentY);
  }

  // --- Final Save/Download ---
  doc.save(`Invoice-${invoiceData.invoiceNumber || "draft"}.pdf`);
}
