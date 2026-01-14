// lib/pdf/exportReportPDF.ts
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export type ExportSection = {
  ref: React.RefObject<HTMLDivElement>;
};

export interface ExportPDFOptions {
  filename: string;
  header: {
    title: string;
    dateRangeText?: string;
  };
  sections: ExportSection[];
}

export async function exportReportPDF({
  filename,
  header,
  sections,
}: ExportPDFOptions) {
  const pdf = new jsPDF("p", "mm", "a4");
  const margin = 10;
  let currentY = margin;

  /* ---------- HEADER ---------- */
  const headerDiv = document.createElement("div");
  headerDiv.style.cssText =
    "position:absolute;left:-9999px;background:white;padding:20px;width:800px;text-align:center;font-family:Sarabun,sans-serif";

  headerDiv.innerHTML = `
    <h1 style="font-size:24px;font-weight:bold;">${header.title}</h1>
    ${
      header.dateRangeText
        ? `<p style="font-size:14px;">${header.dateRangeText}</p>`
        : ""
    }
    <p style="font-size:12px;">วันที่ส่งออก: ${new Date().toLocaleDateString(
      "th-TH"
    )}</p>
  `;

  document.body.appendChild(headerDiv);
  const headerCanvas = await html2canvas(headerDiv, { scale: 2 });
  document.body.removeChild(headerDiv);

  const pageWidth = pdf.internal.pageSize.getWidth();
  const headerHeight =
    (headerCanvas.height * (pageWidth - margin * 2)) /
    headerCanvas.width;

  pdf.addImage(
    headerCanvas.toDataURL("image/png"),
    "PNG",
    margin,
    currentY,
    pageWidth - margin * 2,
    headerHeight
  );

  currentY += headerHeight + 5;

  /* ---------- SECTIONS ---------- */
  for (const section of sections) {
    if (!section.ref.current) continue;

    pdf.addPage();
    currentY = margin;

    const canvas = await html2canvas(section.ref.current, {
      scale: 2,
      width: 794,
      windowWidth: 794,
      backgroundColor: "#ffffff",
    });

    const imgHeight =
      (canvas.height * (pageWidth - margin * 2)) / canvas.width;

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      margin,
      currentY,
      pageWidth - margin * 2,
      imgHeight
    );
  }

  pdf.save(filename);
}
