
import { Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoiceDocument } from "../InvoiceDocument";
import { InvoiceItem } from "../hooks/useInvoiceItems";
import { Button } from "@/components/ui/button";

interface GenerateInvoiceButtonProps {
  patientData: any;
  billData: any;
  items: InvoiceItem[];
  notes: string;
}

export function GenerateInvoiceButton({ 
  patientData, 
  billData,
  items,
  notes
}: GenerateInvoiceButtonProps) {
  if (!patientData || !billData) return null;

  return (
    <PDFDownloadLink
      document={
        <InvoiceDocument
          patientName={patientData.name}
          patientEmail={patientData.email}
          patientPhone={patientData.number}
          patientAddress={patientData.address}
          items={items}
          notes={notes}
          billDate={new Date(billData.bill_date)}
          billId={billData.id}
        />
      }
      fileName={`invoice-${billData.id.slice(0, 8)}.pdf`}
      className="inline-flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
    >
      <Download className="h-4 w-4" />
      Download Invoice
    </PDFDownloadLink>
  );
}
