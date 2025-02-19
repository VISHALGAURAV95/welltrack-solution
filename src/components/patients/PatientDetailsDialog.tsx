
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Patient } from "@/pages/Index";
import { formatDate } from "@/lib/utils";
import { Phone, Mail, MapPin, Calendar, DollarSign } from "lucide-react";

interface PatientDetailsDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientDetailsDialog({
  patient,
  open,
  onOpenChange,
}: PatientDetailsDialogProps) {
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Patient Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg">
                {patient.name[0]}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {patient.name}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{patient.number}</span>
              </div>
              {patient.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{patient.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{patient.address}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Last Visit: {new Date(patient.visit_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Financial Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Cost</span>
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  ${patient.total_cost.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Amount</span>
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-semibold text-error mt-1">
                  ${patient.pending_amount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Services History</h4>
            <div className="border rounded-lg divide-y">
              {patient.services_used.length > 0 ? (
                patient.services_used.map((service, index) => (
                  <div key={index} className="p-3 text-sm text-gray-600">
                    {service}
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-gray-500 text-center">
                  No services used yet
                </div>
              )}
            </div>
          </div>

          {/* Prescription */}
          {patient.prescription && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Prescription</h4>
              <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                {patient.prescription}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
