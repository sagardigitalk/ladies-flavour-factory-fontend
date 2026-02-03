"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  MdDashboard, 
  MdCategory, 
  MdShoppingBag, 
  MdInventory, 
  MdPeople, 
  MdAssessment, 
  MdQrCode,
  MdSecurity
} from "react-icons/md";
import { clsx } from "clsx";
import { motion } from "framer-motion";

export default function Sidebar() {
  const { hasPermission } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname !== "/dashboard") return false;
    return pathname.startsWith(path);
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: MdDashboard, permission: "view_dashboard" },
    { name: "Catalog", href: "/dashboard/catalog", icon: MdCategory, permission: "view_catalog" },
    { name: "Products", href: "/dashboard/products", icon: MdShoppingBag, permission: "view_products" },
    { name: "Stock", href: "/dashboard/stock", icon: MdInventory, permission: "manage_stock" },
    { name: "Barcodes", href: "/dashboard/barcodes", icon: MdQrCode, permission: "view_barcodes" },
    { name: "Reports", href: "/dashboard/reports", icon: MdAssessment, permission: "view_reports" },
    { name: "Users", href: "/dashboard/users", icon: MdPeople, permission: "view_users" },
    { name: "Roles", href: "/dashboard/roles", icon: MdSecurity, permission: "view_roles" },
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-100 hidden md:flex flex-col h-screen sticky top-0 z-30 font-sans">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-8 border-b border-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-indigo-200 shadow-lg">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              Ladies Flavour
            </h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide">FACTORY ADMIN</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
        {navItems.map((item) => {
          if (item.permission && !hasPermission(item.permission)) return null;
          
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group overflow-hidden",
                active
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              <item.icon
                className={clsx(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-gray-50">
        <div className="bg-indigo-900 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 rounded-full bg-indigo-500/20 blur-xl"></div>
          <p className="text-xs font-medium text-indigo-200 relative z-10">System Status</p>
          <div className="flex items-center gap-2 mt-2 relative z-10">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <p className="text-white text-sm font-bold">Online</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
