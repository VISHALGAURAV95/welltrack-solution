
import { Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoiceDocument } from "../InvoiceDocument";
import { InvoiceItem } from "../hooks/useInvoiceItems";

interface BillFormActionsProps {
  billId?: string;
  onClose: () => void;
  patientData?: any;
  billData?: any;
  items: InvoiceItem[];
  notes: string;
}

export function BillFormActions({ 
  billId, 
  onClose, 
  patientData, 
  billData,
  items,
  notes
}: BillFormActionsProps) {
  return (
    <div className="flex justify-end gap-4 pt-4">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        {billId ? "Update Bill" : "Generate Bill"}
      </button>
      {patientData && billData && (
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
      )}
    </div>
  );
}
