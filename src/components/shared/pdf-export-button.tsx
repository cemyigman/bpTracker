"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { generatePDF, downloadPDF } from "@/lib/pdf";
import { Button } from "@/components/ui/button";

export function PDFExportButton({
  chartRef,
  title,
}: {
  chartRef: React.RefObject<HTMLDivElement | null>;
  title: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (!chartRef.current) return;
    setLoading(true);
    try {
      const blob = await generatePDF(chartRef.current, title);
      downloadPDF(blob, `bp-report-${Date.now()}.pdf`);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Generating..." : "Save PDF"}
    </Button>
  );
}
