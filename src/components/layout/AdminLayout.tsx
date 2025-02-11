
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-8 animate-fadeIn">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
