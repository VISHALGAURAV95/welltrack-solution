import AdminLayout from "@/components/layout/AdminLayout";
import { useState } from "react";
import { Search, Filter, FileText } from "lucide-react";
import { AddPatientDialog } from "@/components/patients/AddPatientDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { GenerateBillDialog } from "@/components/patients/GenerateBillDialog";

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  visit_date: string;
  total_cost: number;
  pending_amount: number;
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);

  const { data: patientsData, refetch: refetchPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const handleAddPatient = async (patientData: any) => {
    const newPatient: Patient = {
      id: Date.now().toString(),
      name: patientData.name,
      email: patientData.email,
      phone: patientData.number,
      visit_date: new Date().toISOString().split('T')[0],
      total_cost: 0,
      pending_amount: 0,
    };

    setPatients((prevPatients) => [...prevPatients, newPatient]);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your patient records</p>
          </div>
          <AddPatientDialog onPatientAdded={handleAddPatient} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patientsData?.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {patient.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {patient.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {patient.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(patient.visit_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      ${patient.total_cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-error text-right">
                      ${patient.pending_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <GenerateBillDialog
                        patientId={patient.id}
                        patientName={patient.name}
                        onBillGenerated={() => refetchPatients()}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Index;
