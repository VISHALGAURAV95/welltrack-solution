import { Dialog } from "@/components/ui/dialog";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Edit2, FileText, Wallet } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { useInvoiceItems, InvoiceItem } from "./hooks/useInvoiceItems";
import { InvoiceItemsForm } from "./components/InvoiceItemsForm";
import { BillFormActions } from "./components/BillFormActions";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  paidAmount: z.string().min(1, "Paid amount is required"),
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
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { toast } = useToast();
  const { invoiceItems, setInvoiceItems, addInvoiceItem, removeInvoiceItem, updateInvoiceItem } = useInvoiceItems();
  const [paymentAmount, setPaymentAmount] = useState("0");

  const { data: patientData } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*, bills(amount, status)')
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
      amount: "0",
      paidAmount: patientData?.pending_amount?.toString() || "0",
      services: "",
      notes: "",
      items: [{ item: "", description: "", amount: 0 }],
    },
  });

  useEffect(() => {
    if (billData) {
      const items = (billData.items as unknown as InvoiceItem[]) || [{ item: "", description: "", amount: 0 }];
      form.reset({
        amount: billData.amount.toString(),
        paidAmount: patientData?.pending_amount?.toString() || "0",
        services: billData.services?.join(", ") || "",
        notes: billData.notes || "",
        items: items,
      });
      setInvoiceItems(items);
    }
  }, [billData, form, setInvoiceItems, patientData]);

  useEffect(() => {
    if (open && patientData?.pending_amount) {
      form.setValue('paidAmount', patientData.pending_amount.toString());
    }
  }, [open, patientData, form]);

  useEffect(() => {
    if (invoiceItems.length > 0) {
      const totalAmount = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
      form.setValue('amount', totalAmount.toString());

      const services = invoiceItems
        .map(item => item.item)
        .filter(item => item.trim() !== '')
        .join(', ');
      form.setValue('services', services);
    }
  }, [invoiceItems, form]);

  const handleUpdateInvoiceItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = updateInvoiceItem(index, field, value);
    form.setValue('items', newItems);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        const rowElement = document.activeElement?.closest('tr');
        if (rowElement) {
          rowElement.blur();
        }
      }, 0);
    }
  };

  const handlePendingPayment = async () => {
    try {
      const amount = parseFloat(paymentAmount);
      if (amount <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid Amount",
          description: "Please enter a valid payment amount",
        });
        return;
      }

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          patient_id: patientId,
          amount: amount,
          mode: 'Cash',
          status: 'Completed'
        });

      if (paymentError) throw paymentError;

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });

      onBillGenerated();
      setShowPaymentDialog(false);
      setPaymentAmount("0");
    } catch (error: any) {
      console.error('Error with payment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process payment",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const servicesArray = values.services.split(',').map(s => s.trim());
      const totalAmount = parseFloat(values.amount);
      const paidAmount = parseFloat(values.paidAmount);
      const currentDate = new Date().toISOString();

      if (paidAmount > 0 && !billId && totalAmount === 0) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            patient_id: patientId,
            amount: paidAmount,
            mode: 'Cash',
            status: 'Completed'
          });

        if (paymentError) throw paymentError;
      } else {
        if (billId) {
          const { error: billError } = await supabase
            .from('bills')
            .update({
              amount: totalAmount,
              services: servicesArray,
              status: paidAmount >= totalAmount ? 'Paid' : 'Pending',
              bill_date: currentDate,
              notes: values.notes,
              items: values.items
            })
            .eq('id', billId);

          if (billError) throw billError;
        } else {
          const { data: billData, error: billError } = await supabase
            .from('bills')
            .insert({
              patient_id: patientId,
              amount: totalAmount,
              services: servicesArray,
              status: paidAmount >= totalAmount ? 'Paid' : 'Pending',
              bill_date: currentDate,
              notes: values.notes,
              items: values.items
            })
            .select()
            .single();

          if (billError) throw billError;

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
      }

      toast({
        title: "Success",
        description: billId 
          ? "Bill updated successfully" 
          : totalAmount === 0 
            ? "Payment recorded successfully"
            : "Bill generated successfully",
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
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button 
            className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
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
        <DialogContent className="sm:max-w-[725px]" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>
              {billId ? "Edit Bill for " : "Generate Bill for "}{patientName}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!billId && patientData?.pending_amount > 0 && (
                <div className="bg-amber-50 p-4 rounded-lg flex items-center justify-between">
                  <p className="text-amber-800">
                    Patient has a pending amount of ${patientData.pending_amount.toLocaleString()}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(false);
                      setShowPaymentDialog(true);
                      setPaymentAmount(patientData.pending_amount.toString());
                    }}
                    className="bg-white"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Pay Pending Amount
                  </Button>
                </div>
              )}

              <InvoiceItemsForm
                items={invoiceItems}
                onUpdateItem={handleUpdateInvoiceItem}
                onAddItem={addInvoiceItem}
                onRemoveItem={removeInvoiceItem}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          type="number"
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paidAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount to Pay</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="services"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Services</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        placeholder="Services will be automatically added from items..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <BillFormActions
                billId={billId}
                onClose={() => handleOpenChange(false)}
              />
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pay Pending Amount</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="paymentAmount" className="text-sm font-medium">
                Payment Amount
              </label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount to pay"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePendingPayment}
            >
              Pay Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
