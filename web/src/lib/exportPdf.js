import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Capture a DOM element and save it as a multi-page A4 PDF for management.
export async function exportElementToPdf(element, filename = "sales_dashboard_report.pdf") {
  const canvas = await html2canvas(element, {
    backgroundColor: "#00172B",
    scale: 2,
    useCORS: true,
  });

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;
  const imgData = canvas.toDataURL("image/png");

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Add extra pages if the dashboard is taller than one page.
  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}
