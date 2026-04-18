"use client";
// components/shared/Sidebar.tsx

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bus, LayoutDashboard, CreditCard, PlusCircle, RotateCcw,
  User, LogOut, ChevronLeft, Shield, Users, Route, BarChart3, Menu
} from "lucide-react";
import { useAuth } from "@/hooks";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const userNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Passes", href: "/dashboard/passes", icon: CreditCard },
  { label: "Apply for Pass", href: "/dashboard/apply", icon: PlusCircle },
  { label: "Renew Pass", href: "/dashboard/renew", icon: RotateCcw },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Applications", href: "/admin/passes", icon: CreditCard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Routes", href: "/admin/routes", icon: Route },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = isAdmin ? adminNav : userNav;

  return (
    <aside
      className={cn(
        "sidebar h-screen flex flex-col transition-all duration-300 ease-in-out flex-shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 h-16">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
              <Bus className="w-4 h-4 text-blue-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm truncate leading-tight">CloudBusPass</p>
              {isAdmin && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Shield className="w-2.5 h-2.5 text-blue-400" />
                  <span className="text-blue-400 text-[10px] font-medium">ADMIN</span>
                </div>
              )}
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mx-auto">
            <Bus className="w-4 h-4 text-blue-400" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white transition-colors ml-auto"
        >
          {collapsed
            ? <Menu className="w-4 h-4" />
            : <ChevronLeft className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "sidebar-link",
                isActive && "active",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-white/10">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sm font-bold text-blue-300 flex-shrink-0">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate leading-tight">{user?.name}</p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sm font-bold text-blue-300">
              {user?.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        <button
          onClick={logout}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
