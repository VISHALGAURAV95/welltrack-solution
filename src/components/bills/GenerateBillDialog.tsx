import { Dialog } from "@/components/ui/dialog";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Edit2, FileText, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoiceDocument } from "./InvoiceDocument";

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  paidAmount: z.string().min(1, "Paid amount is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  services: z.string().min(1, "Please specify at least one service"),
  notes: z.string().optional(),
  items: z.array(z.object({
    item: z.string(),
    description: z.string(),
    amount: z.number(),
  })).min(1, "At least one item is required"),
});

interface GenerateBillDialogProps {
  patientId: string;
  patientName: string;
  onBillGenerated: () => void;
  billId?: string;
}

export function GenerateBillDialog({ patientId, patientName, onBillGenerated, billId }: GenerateBillDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [invoiceItems, setInvoiceItems] = useState([{ item: "", description: "", amount: 0 }]);

  const { data: patientData } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: billData } = useQuery({
    queryKey: ['bill', billId],
    queryFn: async () => {
      if (!billId) return null;
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!billId,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      paidAmount: "0",
      description: "",
      services: "",
      notes: "",
      items: [{ item: "", description: "", amount: 0 }],
    },
  });

  useEffect(() => {
    if (billData) {
      form.reset({
        amount: billData.amount.toString(),
        paidAmount: "0",
        description: billData.description || "",
        services: billData.services?.join(", ") || "",
        notes: billData.notes || "",
        items: billData.items || [{ item: "", description: "", amount: 0 }],
      });
    }
  }, [billData, form]);

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { item: "", description: "", amount: 0 }]);
  };

  const updateInvoiceItem = (index: number, field: keyof typeof invoiceItems[0], value: string | number) => {
    const newItems = [...invoiceItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setInvoiceItems(newItems);
    form.setValue('items', newItems);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const servicesArray = values.services.split(',').map(s => s.trim());
      const totalAmount = parseFloat(values.amount);
      const paidAmount = parseFloat(values.paidAmount);
      const currentDate = new Date().toISOString();
      
      // Update patient's visit date
      const { error: patientError } = await supabase
        .from('patients')
        .update({ visit_date: currentDate })
        .eq('id', patientId);

      if (patientError) throw patientError;
      
      if (billId) {
        // Update existing bill
        const { error: billError } = await supabase
          .from('bills')
          .update({
            amount: totalAmount,
            description: values.description,
            services: servicesArray,
            status: paidAmount >= totalAmount ? 'Paid' : 'Pending',
            bill_date: currentDate
          })
          .eq('id', billId);

        if (billError) throw billError;
      } else {
        // Create new bill
        const { data: billData, error: billError } = await supabase
          .from('bills')
          .insert({
            patient_id: patientId,
            amount: totalAmount,
            description: values.description,
            services: servicesArray,
            status: paidAmount >= totalAmount ? 'Paid' : 'Pending',
            bill_date: currentDate
          })
          .select()
          .single();

        if (billError) throw billError;

        // If there's a payment, record it
        if (paidAmount > 0) {
          const { error: paymentError } = await supabase
            .from('payments')
            .insert({
              patient_id: patientId,
              amount: paidAmount,
              mode: 'Cash',
              status: 'Completed',
              bill_id: billData.id
            });

          if (paymentError) throw paymentError;
        }
      }

      toast({
        title: "Success",
        description: billId ? "Bill updated successfully" : "Bill generated successfully",
      });

      onBillGenerated();
      setOpen(false);
      form.reset();
    } catch (error: any) {
      console.error('Error with bill:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process bill",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1">
          {billId ? (
            <>
              <Edit2 className="h-4 w-4" />
              <span>Edit Bill</span>
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              <span>Generate Bill</span>
            </>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>
            {billId ? "Edit Bill for " : "Generate Bill for "}{patientName}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              {invoiceItems.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <FormItem className="flex-1">
                    <FormLabel>Item</FormLabel>
                    <FormControl>
                      <Input
                        value={item.item}
                        onChange={(e) => updateInvoiceItem(index, 'item', e.target.value)}
                        placeholder="e.g., Consultation"
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem className="flex-1">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        value={item.description}
                        onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
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
                        onChange={(e) => updateInvoiceItem(index, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </FormControl>
                  </FormItem>
                </div>
              ))}
              <button
                type="button"
                onClick={addInvoiceItem}
                className="text-primary hover:text-primary/80 transition-colors text-sm"
              >
                + Add Item
              </button>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
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
                      items={invoiceItems}
                      notes={form.getValues("notes") || ""}
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
