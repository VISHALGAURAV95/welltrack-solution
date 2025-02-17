
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { InvoiceItem } from "../hooks/useInvoiceItems";

interface InvoiceItemsFormProps {
  items: InvoiceItem[];
  onUpdateItem: (index: number, field: keyof InvoiceItem, value: string | number) => void;
  onAddItem: () => void;
}

export function InvoiceItemsForm({ items, onUpdateItem, onAddItem }: InvoiceItemsFormProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex gap-4">
          <FormItem className="flex-1">
            <FormLabel>Item</FormLabel>
            <FormControl>
              <Input
                value={item.item}
                onChange={(e) => onUpdateItem(index, 'item', e.target.value)}
                placeholder="e.g., Consultation"
              />
            </FormControl>
          </FormItem>
          <FormItem className="flex-1">
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input
                value={item.description}
                onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                placeholder="e.g., General checkup"
              />
            </FormControl>
          </FormItem>
          <FormItem className="w-32">
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <Input
                type="number"
                value={item.amount}
                onChange={(e) => onUpdateItem(index, 'amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </FormControl>
          </FormItem>
        </div>
      ))}
      <button
        type="button"
        onClick={onAddItem}
        className="text-primary hover:text-primary/80 transition-colors text-sm"
      >
        + Add Item
      </button>
    </div>
  );
}
