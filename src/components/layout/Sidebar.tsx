
import { useState } from "react";
import { Users, FileText, CreditCard, BarChart2, MessageSquare, Settings, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: Users, label: "Patients", href: "/" },
  { icon: FileText, label: "Bills", href: "/bills" },
  { icon: CreditCard, label: "Payments", href: "/payments" },
  { icon: BarChart2, label: "Analytics", href: "/analytics" },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <h1 className={cn(
          "font-bold text-xl transition-opacity duration-300",
          collapsed ? "opacity-0 w-0" : "opacity-100"
        )}>
          MedClinic
        </h1>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="flex items-center gap-4 p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className={cn(
                  "text-sm font-medium transition-opacity duration-300",
                  collapsed ? "opacity-0 w-0" : "opacity-100"
                )}>
                  {item.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
