
import { useState } from 'react';

export interface InvoiceItem {
  item: string;
  description: string;
  amount: number;
}

export function useInvoiceItems(initialItems?: InvoiceItem[]) {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>(
    initialItems || [{ item: "", description: "", amount: 0 }]
  );

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { item: "", description: "", amount: 0 }]);
  };

  const removeInvoiceItem = (index: number) => {
    const newItems = [...invoiceItems];
    newItems.splice(index, 1);
    setInvoiceItems(newItems);
    return newItems;
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...invoiceItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setInvoiceItems(newItems);
    return newItems;
  };

  return {
    invoiceItems,
    setInvoiceItems,
    addInvoiceItem,
    removeInvoiceItem,
    updateInvoiceItem,
  };
}
