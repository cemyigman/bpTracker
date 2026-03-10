import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { format } from "date-fns";

export async function generatePDF(
  element: HTMLElement,
  title: string
): Promise<Blob> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const pdf = new jsPDF("landscape", "mm", "a4");

  pdf.setFontSize(18);
  pdf.text(title, 15, 20);

  pdf.setFontSize(10);
  pdf.text(`Generated on ${format(new Date(), "PPP")}`, 15, 28);

  const imgData = canvas.toDataURL("image/png");
  const pageWidth = pdf.internal.pageSize.getWidth() - 30;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 15, 35, pageWidth, Math.min(imgHeight, 150));

  return pdf.output("blob");
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
