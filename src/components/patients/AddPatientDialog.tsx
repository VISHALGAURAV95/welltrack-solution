
import { Dialog } from "@/components/ui/dialog";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { PlusCircle } from "lucide-react";
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
  name: z.string().min(2, "Name must be at least 2 characters"),
  number: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  services: z.string().min(1, "Please select at least one service"),
  prescription: z.string().optional(),
});

interface AddPatientDialogProps {
  onPatientAdded: (patientData: z.infer<typeof formSchema>) => void;
}

export function AddPatientDialog({ onPatientAdded }: AddPatientDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      number: "",
      email: "",
      address: "",
      services: "",
      prescription: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // First check if the phone number already exists
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('number', values.number)
        .single();

      if (existingPatient) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "A patient with this phone number already exists",
        });
        return;
      }

      // If no existing patient, proceed with insertion
      const servicesArray = values.services.split(',').map(s => s.trim());
      
      const { data, error } = await supabase
        .from('patients')
        .insert({
          name: values.name,
          number: values.number,
          email: values.email,
          address: values.address,
          services: servicesArray,
          prescription: values.prescription || null,
          visit_date: new Date().toISOString(),
          total_cost: 0, // Initial values
          pending_amount: 0,
          services_used: [],
          notification_system: false
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast({
            variant: "destructive",
            title: "Error",
            description: "A patient with this phone number already exists",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Success",
        description: "Patient added successfully",
      });

      onPatientAdded(values);
      setOpen(false);
      form.reset();
    } catch (error: any) {
      console.error('Error adding patient:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add patient",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <PlusCircle className="h-5 w-5" />
          <span>Add Patient</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 890" type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter full address"
                      className="resize-none"
                      {...field}
                    />
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
                  <FormLabel>Services Required</FormLabel>
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
              name="prescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prescription (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter prescription details"
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
                Add Patient
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
