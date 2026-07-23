import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton } from "@/components/ui/signin.tsx";
import DayBreakLogo from "@/components/DayBreakLogo.tsx";
import { DAYBREAK_COPYRIGHT } from "@/lib/brand.ts";
import { useAuth } from "@/hooks/use-auth.ts";
import { LayoutDashboard, Users, Package, FileText, Receipt, ClipboardList, Settings, LogOut, Menu, X, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/products", icon: Package, label: "Products & Services" },
  { href: "/quotations", icon: ClipboardList, label: "Quotations" },
  { href: "/invoices", icon: FileText, label: "Invoices" },
  { href: "/receipts", icon: Receipt, label: "Receipts" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

function AppSidebar({ onClose }: { onClose?: () => void }) {
  const { signout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <DayBreakLogo size="sm" />
        {onClose && (
          <button onClick={onClose} className="text-sidebar-foreground/60 hover:text-sidebar-foreground md:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.href;
          return (
            <button key={item.href}
              onClick={() => { navigate(item.href); onClose?.(); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                active ? "bg-sidebar-accent text-[#F5A623]" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}>
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-1 mb-2 px-1">
          {[
            { value: "light", icon: Sun },
            { value: "dark", icon: Moon },
            { value: "system", icon: Monitor },
          ].map(({ value, icon: Icon }) => (
            <button key={value} onClick={() => setTheme(value)} title={value}
              className={cn(
                "flex-1 flex items-center justify-center py-1.5 rounded-md text-xs transition-colors cursor-pointer",
                theme === value ? "bg-[#F5A623] text-white" : "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}>
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
        <button onClick={() => signout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors cursor-pointer">
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
        <p className="text-xs text-sidebar-foreground/30 mt-3 px-3 leading-relaxed">{DAYBREAK_COPYRIGHT}</p>
      </div>
    </div>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPage = navItems.find((n) => n.href === location.pathname)?.label ?? "Dashboard";

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden md:flex md:w-60 flex-shrink-0 flex-col border-r border-sidebar-border">
        <AppSidebar />
      </aside>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 shadow-xl"><AppSidebar onClose={() => setSidebarOpen(false)} /></div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card">
          <button onClick={() => setSidebarOpen(true)} className="cursor-pointer text-foreground"><Menu className="h-5 w-5" /></button>
          <span className="font-semibold text-sm">{currentPage}</span>
          <DayBreakLogo size="sm" />
        </header>
        <main className="flex-1 overflow-auto"><Outlet /></main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border flex md:hidden z-40">
        {navItems.slice(0, 5).map((item) => {
          const active = location.pathname === item.href;
          return (
            <a key={item.href} href={item.href}
              className={cn("flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors",
                active ? "text-[#F5A623]" : "text-sidebar-foreground/50")}>
              <item.icon className="h-5 w-5" />
              <span className="hidden sm:block">{item.label.split(" ")[0]}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}

export default function AppLayoutWrapper() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <div className="space-y-4 w-64">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
          <DayBreakLogo size="lg" />
          <p className="text-muted-foreground">Sign in to access your business suite</p>
          <SignInButton />
        </div>
      </Unauthenticated>
      <Authenticated><AppLayout /></Authenticated>
    </>
  );
}
