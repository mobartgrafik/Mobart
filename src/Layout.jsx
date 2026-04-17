import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { createPageUrl } from "@/utils";
import {
  Archive,
  FileText,
  History,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Printer,
  Search,
  Settings2,
  Sparkles,
  Sun,
  User2,
  Users,
  X,
} from "lucide-react";
import GlobalSearch from "@/components/GlobalSearch";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

const NAV_SECTIONS = [
  {
    title: "Centrum pracy",
    items: [
      { name: "Dashboard", label: "Pulpit", icon: LayoutDashboard, hint: "Podsumowanie dnia" },
      { name: "Orders", label: "Zlecenia", icon: FileText, hint: "Bieżąca produkcja" },
      { name: "CompletedOrders", label: "Zakończone", icon: Archive, hint: "Zamknięte realizacje" },
      { name: "Clients", label: "Klienci", icon: Users, hint: "Relacje i kontakty" },
      { name: "Handoff", label: "Do przekazania", icon: Printer, hint: "Gotowe do odbioru" },
      { name: "History", label: "Historia zmian", icon: History, hint: "Aktywność zespołu" },
    ],
  },
  {
    title: "Narzędzia",
    items: [
      { name: "BannerCreator", label: "Kreator baneru", icon: Image, hint: "Szybkie przygotowanie" },
      { name: "ServiceMode", label: "Tryb serwisowy", icon: Settings2, hint: "Ustawienia systemu", adminOnly: true },
    ],
  },
];

function SidebarLink({ item, isActive, onClick, isDarkMode, style }) {
  const baseClasses = isDarkMode
    ? "text-slate-300 hover:text-white hover:bg-white/10"
    : "text-slate-600 hover:text-slate-950 hover:bg-slate-900/5";
  const activeClasses = isDarkMode
    ? "bg-white text-slate-950 shadow-[0_18px_44px_-24px_rgba(255,255,255,0.8)] ring-1 ring-white/70"
    : "bg-slate-950 text-white shadow-[0_20px_45px_-24px_rgba(15,23,42,0.55)] ring-1 ring-slate-950/10";
  const iconClasses = isDarkMode
    ? isActive
      ? "bg-slate-900 text-white"
      : "bg-white/8 text-slate-300"
    : isActive
      ? "bg-white/20 text-white"
      : "bg-slate-900/5 text-slate-500";

  return (
    <Link
      to={createPageUrl(item.name)}
      onClick={onClick}
      style={style}
      className={`menu-link group relative flex items-center gap-3 overflow-hidden rounded-[24px] px-3 py-3 transition-all duration-300 ${isActive ? activeClasses : baseClasses}`}
    >
      <div
        className={`menu-link-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${iconClasses}`}
      >
        <item.icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{item.label}</p>
        <p className={`truncate text-xs ${isActive ? "text-inherit/70" : isDarkMode ? "text-slate-500 group-hover:text-slate-400" : "text-slate-400 group-hover:text-slate-500"}`}>
          {item.hint}
        </p>
      </div>
    </Link>
  );
}

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { authorLabel, avatarUrl, signOut, role } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
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
  const visibleSections = useMemo(
    () =>
      NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter((item) => !item.adminOnly || role === "admin"),
      })).filter((section) => section.items.length > 0),
    [role]
  );

  const shellClasses = isDarkMode
    ? "bg-[#08111f] text-slate-100"
    : "bg-[#edf2f7] text-slate-900";
  const frameClasses = isDarkMode
    ? "border-white/10 bg-white/[0.03] shadow-[0_30px_120px_-40px_rgba(8,15,31,0.95)]"
    : "border-white/80 bg-white/75 shadow-[0_35px_90px_-40px_rgba(15,23,42,0.28)]";
  const sidebarClasses = isDarkMode
    ? "border-white/10 bg-white/[0.04]"
    : "border-slate-200/80 bg-white/85";
  const headerClasses = isDarkMode
    ? "border-white/10 bg-white/[0.02]"
    : "border-slate-200/80 bg-white/70";
  const panelClasses = isDarkMode
    ? "border-white/10 bg-white/[0.04]"
    : "border-slate-200/80 bg-white/90";
  const quickStatClasses = isDarkMode
    ? "border-white/10 bg-white/[0.045] text-slate-300"
    : "border-white/80 bg-white/80 text-slate-700";

  return (
    <div className={`min-h-screen ${shellClasses}`}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className={`ambient-orb ambient-orb-slow absolute left-[-10%] top-[-15%] h-[28rem] w-[28rem] rounded-full blur-3xl ${isDarkMode ? "bg-cyan-500/16" : "bg-sky-300/30"}`} />
        <div className={`ambient-orb ambient-orb-fast absolute bottom-[-12%] right-[-8%] h-[24rem] w-[24rem] rounded-full blur-3xl ${isDarkMode ? "bg-blue-500/18" : "bg-indigo-200/45"}`} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition-opacity duration-300 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="relative mx-auto flex min-h-screen max-w-[1680px] p-3 lg:p-5">
        <div className={`flex w-full overflow-hidden rounded-[32px] border backdrop-blur-2xl ${frameClasses}`}>
          <aside
            className={`menu-surface fixed inset-y-3 left-3 z-50 flex w-[310px] max-w-[calc(100vw-1.5rem)] flex-col rounded-[28px] border p-4 transition-transform duration-500 ease-out lg:static lg:inset-auto lg:h-auto lg:w-[300px] lg:max-w-none lg:translate-x-0 ${sidebarClasses} ${
              sidebarOpen ? "translate-x-0" : "-translate-x-[110%]"
            }`}
          >
            <div className="flex items-center justify-between gap-3 px-2 py-2">
              <Link
                to={createPageUrl("Dashboard")}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-[24px] px-1 py-1 transition-all duration-300 ${
                  isDarkMode ? "hover:bg-white/6" : "hover:bg-slate-950/5"
                }`}
              >
                <div className={`relative flex h-14 w-14 items-center justify-center rounded-[22px] transition-transform duration-300 group-hover:scale-105 ${isDarkMode ? "bg-white text-slate-950" : "bg-slate-950 text-white"}`}>
                  <div className={`absolute inset-0 rounded-[22px] ${isDarkMode ? "bg-cyan-300/25" : "bg-sky-400/15"} pulse-ring`} />
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight">GCRM</p>
                  <p className={isDarkMode ? "text-sm text-slate-400" : "text-sm text-slate-500"}>Studio operacyjne</p>
                </div>
              </Link>
              <button
                type="button"
                className={`rounded-2xl p-2 lg:hidden ${isDarkMode ? "text-slate-400 hover:bg-white/8 hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className={`mt-5 rounded-[26px] border p-4 ${panelClasses}`}>
              <p className={`text-xs font-medium uppercase tracking-[0.24em] ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Dzisiejszy fokus</p>
              <h2 className="mt-2 text-xl font-semibold leading-tight">Lepiej widoczna praca zespołu, mniej klikania między modułami.</h2>
              <p className={`mt-2 text-sm leading-6 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Zaczynamy od menu i pulpitu, żeby najważniejsze akcje były bliżej ręki.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className={`rounded-[20px] border px-3 py-2 ${quickStatClasses}`}>
                  <p className={`text-[11px] uppercase tracking-[0.22em] ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Tempo</p>
                  <p className="mt-1 text-sm font-semibold">Szybkie wejście</p>
                </div>
                <div className={`rounded-[20px] border px-3 py-2 ${quickStatClasses}`}>
                  <p className={`text-[11px] uppercase tracking-[0.22em] ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Widok</p>
                  <p className="mt-1 text-sm font-semibold">Mniej chaosu</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
              {visibleSections.map((section) => (
                <div key={section.title}>
                  <p className={`px-3 text-xs font-medium uppercase tracking-[0.24em] ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{section.title}</p>
                  <div className="mt-3 space-y-2">
                    {section.items.map((item, index) => (
                      <SidebarLink
                        key={item.name}
                        item={item}
                        isActive={currentPageName === item.name}
                        onClick={() => setSidebarOpen(false)}
                        isDarkMode={isDarkMode}
                        style={{ animationDelay: `${index * 60}ms` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-6 rounded-[26px] border p-4 ${panelClasses}`}>
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-12 w-12 rounded-2xl object-cover" />
                ) : (
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDarkMode ? "bg-white/8 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                    <User2 className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{authorLabel}</p>
                  <p className={`truncate text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {role === "admin" ? "Administrator" : "Członek zespołu"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className={`mt-4 w-full justify-center gap-2 rounded-2xl border ${isDarkMode ? "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10" : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"}`}
              >
                <LogOut className="h-4 w-4" />
                Wyloguj
              </Button>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className={`sticky top-0 z-30 flex h-20 items-center gap-3 border-b px-4 sm:px-6 lg:px-8 ${headerClasses}`}>
              <button
                type="button"
                className={`rounded-2xl p-2 lg:hidden ${isDarkMode ? "text-slate-300 hover:bg-white/8 hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className={`menu-surface group flex flex-1 items-center gap-3 rounded-[22px] border px-4 py-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)] sm:max-w-xl ${panelClasses}`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${isDarkMode ? "bg-white/8 text-slate-300" : "bg-slate-100 text-slate-500"}`}>
                  <Search className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>Szukaj zleceń, klientów i akcji</p>
                  <p className={`truncate text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Najkrótsza droga do danych w systemie</p>
                </div>
                <kbd className={`hidden rounded-xl border px-2 py-1 text-xs sm:inline-flex ${isDarkMode ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"}`}>Ctrl+K</kbd>
              </button>

              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(isDarkMode ? "light" : "dark")}
                  className={`rounded-2xl border px-3 ${isDarkMode ? "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"}`}
                >
                  {isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  {isDarkMode ? "Jasny" : "Ciemny"}
                </Button>
                <Link
                  to="/profile"
                  className={`menu-surface hidden items-center gap-3 rounded-[22px] border px-3 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)] sm:flex ${panelClasses}`}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-11 w-11 rounded-2xl object-cover" />
                  ) : (
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isDarkMode ? "bg-white/8 text-slate-300" : "bg-slate-100 text-slate-500"}`}>
                      <User2 className="h-4 w-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="max-w-40 truncate text-sm font-semibold">{authorLabel}</p>
                    <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Profil i ustawienia</p>
                  </div>
                </Link>
              </div>
            </header>

            <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

            <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
