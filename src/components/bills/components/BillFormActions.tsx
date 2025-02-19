
import { Button } from "@/components/ui/button";

interface BillFormActionsProps {
  billId?: string;
  onClose: () => void;
}

export function BillFormActions({ billId, onClose }: BillFormActionsProps) {
  return (
    <div className="flex justify-end gap-4 pt-4">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
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
    </div>
  );
}
