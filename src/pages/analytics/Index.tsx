
import AdminLayout from "@/components/layout/AdminLayout";
import { BarChart2, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#9b87f5", "#4ade80", "#ef4444", "#f97316"];

const Analytics = () => {
  // Fetch all necessary data
  const { data: patientsData } = useQuery({
    queryKey: ['analytics-patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: billsData } = useQuery({
    queryKey: ['analytics-bills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: paymentsData } = useQuery({
    queryKey: ['analytics-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  // Calculate key metrics
  const totalPatients = patientsData?.length || 0;
  const totalRevenue = paymentsData?.reduce((sum, payment) => 
    payment.status === 'Completed' ? sum + payment.amount : sum, 0
  ) || 0;
  const totalPending = patientsData?.reduce((sum, patient) => 
    sum + (patient.pending_amount || 0), 0
  ) || 0;

  // Prepare data for monthly revenue chart
  const getMonthlyRevenue = () => {
    if (!paymentsData) return [];
    
    const monthlyData: { [key: string]: number } = {};
    paymentsData.forEach(payment => {
      if (payment.status === 'Completed') {
        const month = new Date(payment.date).toLocaleString('default', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + payment.amount;
      }
    });

    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount,
    }));
  };

  // Prepare data for payment status pie chart
  const getPaymentStatusData = () => {
    if (!paymentsData) return [];

    const statusCount: { [key: string]: number } = {};
    paymentsData.forEach(payment => {
      statusCount[payment.status] = (statusCount[payment.status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([name, value]) => ({
      name,
      value,
    }));
  };

  // Prepare data for services bar chart
  const getServicesData = () => {
    if (!billsData) return [];

    const serviceCount: { [key: string]: number } = {};
    billsData.forEach(bill => {
      bill.services?.forEach(service => {
        serviceCount[service] = (serviceCount[service] || 0) + 1;
      });
    });

    return Object.entries(serviceCount)
      .map(([service, count]) => ({
        service,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 services
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">View insights and reports</p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            <Download className="h-5 w-5" />
            <span>Export Report</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Total Patients</h3>
            <p className="text-3xl font-bold text-primary mt-2">{totalPatients}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
            <p className="text-3xl font-bold text-success mt-2">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pending Payments</h3>
            <p className="text-3xl font-bold text-error mt-2">
              ${totalPending.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getMonthlyRevenue()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#9b87f5"
                    strokeWidth={2}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPaymentStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPaymentStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Services</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getServicesData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#9b87f5" name="Number of Services" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
