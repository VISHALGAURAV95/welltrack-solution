
import { Dialog } from "@/components/ui/dialog";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { FileText } from "lucide-react";
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

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  services: z.string().min(1, "Please specify at least one service"),
});

interface GenerateBillDialogProps {
  patientId: string;
  patientName: string;
  onBillGenerated: () => void;
}

export function GenerateBillDialog({ patientId, patientName, onBillGenerated }: GenerateBillDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      description: "",
      services: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const servicesArray = values.services.split(',').map(s => s.trim());
      
      const { data, error } = await supabase
        .from('bills')
        .insert({
          patient_id: patientId,
          amount: parseFloat(values.amount),
          description: values.description,
          services: servicesArray,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bill generated successfully",
      });

      onBillGenerated();
      setOpen(false);
      form.reset();
    } catch (error: any) {
      console.error('Error generating bill:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate bill",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span>Generate Bill</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Generate Bill for {patientName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Services</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Consultation, X-ray, Blood Test"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter bill description"
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
                Generate Bill
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
