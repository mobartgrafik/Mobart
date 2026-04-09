import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, FileText, Users, Printer, Menu, X, History, Image, Search, LogOut, User2, Archive, Sun, Moon, Settings2 } from "lucide-react";
import GlobalSearch from "@/components/GlobalSearch";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { name: "Dashboard", label: "Pulpit", icon: LayoutDashboard },
  { name: "Orders", label: "Zlecenia", icon: FileText },
  { name: "CompletedOrders", label: "Zakończone", icon: Archive },
  { name: "Clients", label: "Klienci", icon: Users },
  { name: "Handoff", label: "Do przekazania", icon: Printer },
  { name: "History", label: "Historia zmian", icon: History },
  { name: "BannerCreator", label: "Kreator baneru", icon: Image },
  { name: "ServiceMode", label: "Tryb serwisowy", icon: Settings2 },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { authorLabel, avatarUrl, signOut, role } = useAuth();
  const { theme, setTheme } = useTheme();
  const visibleNavItems = NAV_ITEMS.filter((item) => item.name !== "ServiceMode" || role === "admin");

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = !mounted || theme !== "light";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <style>{`
        .dark {
          --background: 0 0% 4%;
          --foreground: 240 5% 96%;
          --card: 240 6% 8%;
          --card-foreground: 240 5% 96%;
          --popover: 240 6% 8%;
          --popover-foreground: 240 5% 96%;
          --primary: 217 91% 60%;
          --primary-foreground: 0 0% 100%;
          --secondary: 240 5% 15%;
          --secondary-foreground: 240 5% 96%;
          --muted: 240 4% 16%;
          --muted-foreground: 240 4% 64%;
          --accent: 240 5% 15%;
          --accent-foreground: 240 5% 96%;
          --destructive: 0 84% 60%;
          --destructive-foreground: 0 0% 100%;
          --border: 240 4% 16%;
          --input: 240 4% 16%;
          --ring: 217 91% 60%;
          --radius: 0.5rem;
        }
        * { scrollbar-width: thin; scrollbar-color: #27272a transparent; }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-60 bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-800/50 
        flex flex-col z-50 transition-transform duration-200 lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="px-5 h-16 flex items-center justify-between border-b border-zinc-800/50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">GCRM</span>
          </div>
          <button className="lg:hidden text-zinc-400 hover:text-zinc-100" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleNavItems.map(item => {
            const isActive = currentPageName === item.name;
            return (
              <Link key={item.name} to={createPageUrl(item.name)}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? "bg-blue-600/10 text-blue-400" 
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"}
                `}>
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-zinc-800/50 text-xs text-zinc-600">
          Markedia Company
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="h-16 border-b border-zinc-800/50 flex items-center px-5 gap-4 shrink-0 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-30">
          <button className="lg:hidden text-zinc-400 hover:text-zinc-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors text-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Szukaj...</span>
            <kbd className="hidden sm:inline text-xs border border-zinc-700 rounded px-1">Ctrl+K</kbd>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(isDarkMode ? "light" : "dark")}
              className="bg-zinc-800/20 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 gap-2"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDarkMode ? "Jasny" : "Ciemny"}
            </Button>
            <Link
              to="/profile"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/30 border border-zinc-800/60 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition-colors text-sm"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover border border-zinc-700"
                />
              ) : (
                <User2 className="w-4 h-4" />
              )}
              <span className="max-w-40 truncate">{authorLabel}</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="bg-zinc-800/20 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 gap-2"
            >
              <LogOut className="w-4 h-4" />
              Wyloguj
            </Button>
          </div>
        </header>
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

        <main className="flex-1 p-5 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
