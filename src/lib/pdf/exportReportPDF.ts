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

  //   Enter PDF MODE
  document.body.classList.add("pdf-export");
  const originalWidths = new Map<HTMLElement, string>();
  sections.forEach((section) => {
    if (section.ref.current) {
      const el = section.ref.current;
      originalWidths.set(el, el.style.width);
      el.style.width = "1280px"; // desktop breakpoint
    }
  });
  // wait for layout to stabilize
  await document.fonts.ready;
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => setTimeout(r, 50));

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

  const margin = 10;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableHeight = pageHeight - margin * 2;
  let currentY = margin;

  const headerHeight =
    (headerCanvas.height * (pageWidth - margin * 2)) / headerCanvas.width;

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
    const canvas = await html2canvas(section.ref.current, {
      scale: 2,
      backgroundColor: "#ffffff",
    });

    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // ⬅️ ADD PAGE ONLY IF NEEDED
    if (currentY + imgHeight > usableHeight) {
      pdf.addPage();
      currentY = margin;
    }

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      margin,
      currentY,
      imgWidth,
      imgHeight
    );

    currentY += imgHeight + 8; // spacing between sections
  }

  pdf.save(filename);

  //   EXIT PDF MODE
  document.body.classList.remove("pdf-export");
  originalWidths.forEach((width, el) => {
    el.style.width = width;
  });
}
