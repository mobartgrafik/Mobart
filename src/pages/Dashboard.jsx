import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format, isValid, startOfMonth, subMonths } from "date-fns";
import { pl } from "date-fns/locale";
import { Area, AreaChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  FolderKanban,
  Printer,
  TrendingUp,
  Users,
} from "lucide-react";
import { supabase } from "@/supabase";
import { createPageUrl } from "@/utils";
import StatusBadge from "@/components/orders/StatusBadge";
import PriorityBadge from "@/components/orders/PriorityBadge";
import { normalizeOrderPriority, normalizeOrderStatus } from "@/lib/orderValues";
import { useAuth } from "@/lib/AuthContext";

const DAILY_MOTTOS = [
  "Dobre tempo robi się z małych domknięć.",
  "Najpierw porządek, potem rozpęd.",
  "Jedno dobrze zamknięte zlecenie napędza kolejne.",
  "Spokój w produkcji zaczyna się od jasnych priorytetów.",
  "Dziś wygrywa to, co dowiezione na czas.",
  "Mniej chaosu, więcej gotowych tematów.",
  "Rytm zespołu buduje się decyzją za decyzją.",
  "Najkrótsza droga do wyniku to klarowny plan.",
  "Dobrze ustawiony dzień robi miejsce na szybkie finish'e.",
  "Każde zlecenie lubi konkretny następny krok.",
  "Nie wszystko naraz, tylko to co naprawdę rusza produkcję.",
  "Najlepszy przegląd dnia to ten, po którym od razu wiadomo co robić.",
  "Gdy priorytety są czytelne, praca płynie lżej.",
  "Dziś liczy się płynność, nie zamieszanie.",
  "Dobra organizacja brzmi ciszej niż pośpiech, ale działa mocniej.",
  "Najpierw to, co odblokowuje resztę.",
  "Małe usprawnienia robią wielką różnicę pod koniec dnia.",
  "W produkcji wygrywa przygotowanie, nie gaszenie pożarów.",
  "Jeden uporządkowany ekran to kilka minut odzyskane przy każdym kliknięciu.",
  "Domykanie tematów to też forma przyspieszania.",
  "Dziś warto pchać rzeczy do przodu, nie w bok.",
  "Najlepiej idzie to, co ma jasny status i termin.",
  "Mocny dzień zaczyna się od dobrego widoku na całość.",
  "Zespół działa szybciej, gdy system nie przeszkadza.",
  "Najważniejsze zadania nie powinny chować się w tłumie.",
  "Każdy gotowy etap daje więcej miejsca na kolejny.",
  "Dobry workflow czuć po tym, że nic nie trzeba zgadywać.",
  "Dziś mniej przełączania, więcej dowożenia.",
  "Największy progres robią dobrze ustawione detale.",
  "To dobry dzień, żeby skrócić drogę od zgłoszenia do realizacji.",
  "Im prostszy start, tym szybsze tempo pracy.",
  "Dobrze rozpisany dzień to mniej wracania do tych samych pytań.",
  "Najpierw przejrzystość, potem dynamika.",
  "Wszystko wygląda lżej, gdy statusy są pod ręką.",
  "Dziś system ma prowadzić, a nie spowalniać.",
  "To, co pilne, powinno być widoczne od razu.",
  "Najwięcej czasu oszczędza to, czego nie trzeba drugi raz szukać.",
  "Sprawny dzień to suma szybkich, prostych decyzji.",
  "Dobra produkcja lubi rytm bardziej niż improwizację.",
  "Dziś warto zamieniać otwarte tematy w gotowe realizacje.",
  "Jedno kliknięcie mniej, jedno zadanie szybciej.",
  "Praca nabiera tempa, gdy informacje są na swoim miejscu.",
  "Najlepszy pulpit to taki, który od razu ustawia kierunek.",
  "Każdy uporządkowany moduł oddaje czas zespołowi.",
  "Dzisiaj działamy konkretem, nie domysłami.",
  "Priorytet widoczny od razu to mniej przestojów później.",
  "Dobry start dnia to połowa sprawnej realizacji.",
  "Porządek w systemie robi spokój w zespole.",
  "Najpierw rzeczy ważne, potem rzeczy głośne.",
  "Ten dzień najlepiej wygląda w trybie: mniej tarcia, więcej efektu.",
];

function Surface({ children, className = "" }) {
  return (
    <div className={`rounded-[30px] border border-slate-200/80 bg-white/92 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none ${className}`}>
      {children}
    </div>
  );
}

function CircleIndicator({ value, total, label, accent, tone }) {
  const safeTotal = Math.max(total, 1);
  const percentage = Math.round((value / safeTotal) * 100);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`rounded-[28px] border p-5 ${tone}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-xs text-inherit/70">{value} z {total} pozycji</p>
        </div>
        <div className="relative flex h-24 w-24 items-center justify-center">
          <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={accent}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-xl font-semibold">{percentage}%</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-inherit/60">wynik</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, tone, href, caption }) {
  const tones = {
    sky: "bg-sky-500/12 text-sky-600 dark:bg-sky-500/12 dark:text-sky-300",
    emerald: "bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-300",
    amber: "bg-amber-500/12 text-amber-600 dark:bg-amber-500/12 dark:text-amber-300",
    rose: "bg-rose-500/12 text-rose-600 dark:bg-rose-500/12 dark:text-rose-300",
  };

  const content = (
    <Surface className="h-full p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:bg-white/8 dark:text-slate-400">
          Na teraz
        </span>
      </div>
      <p className="mt-6 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{caption}</p>
    </Surface>
  );

  return href ? <Link to={href}>{content}</Link> : content;
}

function QuickAction({ title, description, href, accent }) {
  return (
    <Link
      to={href}
      className={`flex items-center justify-between rounded-[24px] border px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 ${accent}`}
    >
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-inherit/70">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0" />
    </Link>
  );
}

export default function Dashboard() {
  const { authorLabel, role } = useAuth();

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((order) => ({
        ...order,
        status: normalizeOrderStatus(order.status),
        priority: normalizeOrderPriority(order.priority),
      }));
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const dashboardData = useMemo(() => {
    const activeOrders = orders.filter((order) => order.status !== "Zakończone");
    const handoffOrders = orders.filter((order) => order.status === "Do przekazania");
    const urgentOrders = activeOrders.filter((order) => order.priority === "wysoki");
    const completedOrders = orders.filter((order) => order.status === "Zakończone");
    const recentOrders = orders.slice(0, 6);
    const completionRate = orders.length ? Math.round((completedOrders.length / orders.length) * 100) : 0;
    const handoffRate = activeOrders.length ? Math.round((handoffOrders.length / activeOrders.length) * 100) : 0;
    const urgentRate = activeOrders.length ? Math.round((urgentOrders.length / activeOrders.length) * 100) : 0;

    const monthlyTrend = Array.from({ length: 6 }).map((_, index) => {
      const monthStart = startOfMonth(subMonths(new Date(), 5 - index));
      const monthKey = format(monthStart, "yyyy-MM");
      const created = orders.filter((order) => {
        const createdAt = order.created_at ? new Date(order.created_at) : null;
        return createdAt && isValid(createdAt) && format(createdAt, "yyyy-MM") === monthKey;
      }).length;
      const completed = completedOrders.filter((order) => {
        const updatedAt = order.updated_at ? new Date(order.updated_at) : null;
        return updatedAt && isValid(updatedAt) && format(updatedAt, "yyyy-MM") === monthKey;
      }).length;

      return {
        month: format(monthStart, "LLL", { locale: pl }),
        created,
        completed,
      };
    });

    const statusBuckets = [
      { label: "Nowe", value: orders.filter((order) => order.status === "Nowe").length, fill: "#38bdf8" },
      { label: "W trakcie", value: orders.filter((order) => order.status === "W trakcie").length, fill: "#0f172a" },
      { label: "Do przekazania", value: handoffOrders.length, fill: "#10b981" },
      { label: "Zakończone", value: completedOrders.length, fill: "#f59e0b" },
    ];

    const nextDeadlineOrders = activeOrders
      .filter((order) => order.deadline)
      .map((order) => ({ ...order, deadlineDate: new Date(order.deadline) }))
      .filter((order) => isValid(order.deadlineDate))
      .sort((a, b) => a.deadlineDate - b.deadlineDate)
      .slice(0, 4);

    return {
      activeOrders,
      handoffOrders,
      urgentOrders,
      completedOrders,
      recentOrders,
      monthlyTrend,
      statusBuckets,
      nextDeadlineOrders,
      completionRate,
      handoffRate,
      urgentRate,
    };
  }, [orders]);

  const greetingName = authorLabel?.split(" ")?.[0] || authorLabel;
  const mottoOfTheDay = useMemo(() => {
    const today = new Date();
    const dayKey = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 86400000);
    return DAILY_MOTTOS[((dayKey % DAILY_MOTTOS.length) + DAILY_MOTTOS.length) % DAILY_MOTTOS.length];
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <Surface className="overflow-hidden p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-500 dark:bg-white/8 dark:text-slate-400">
                Pulpit startowy
              </div>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-white md:text-5xl">
                Cześć, {greetingName}. {mottoOfTheDay}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-400">
                Hasło dnia zmienia się codziennie, ale cel zostaje ten sam: szybki start, jasne priorytety i mniej skakania między modułami.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <QuickAction
                  title="Dodaj nowe zlecenie"
                  description="Od razu przejdź do formularza realizacji."
                  href={createPageUrl("OrderForm")}
                  accent="border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200"
                />
                <QuickAction
                  title="Przejrzyj klientów"
                  description="Sprawdź kontakty i historię współpracy."
                  href={createPageUrl("Clients")}
                  accent="border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4">
              <div className="rounded-[28px] border border-slate-200/70 bg-slate-100/95 p-5 text-slate-950 shadow-[0_28px_70px_-35px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-[#101826] dark:text-white dark:shadow-[0_28px_70px_-35px_rgba(2,6,23,0.9)]">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Rytm dnia</p>
                <p className="mt-3 text-4xl font-semibold">{dashboardData.activeOrders.length}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">aktywnych zleceń w obiegu</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/75 p-3 dark:bg-white/5">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Do przekazania</p>
                    <p className="mt-1 text-lg font-semibold">{dashboardData.handoffOrders.length}</p>
                  </div>
                  <div className="rounded-2xl bg-white/75 p-3 dark:bg-white/5">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pilne</p>
                    <p className="mt-1 text-lg font-semibold">{dashboardData.urgentOrders.length}</p>
                  </div>
                </div>
              </div>

              <Surface className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Obszary robocze</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Aktualne rozłożenie zadań</p>
                  </div>
                  <FolderKanban className="h-5 w-5 text-slate-400" />
                </div>
                <div className="mt-4 space-y-3">
                  {dashboardData.statusBuckets.map((bucket) => {
                    const maxValue = Math.max(...dashboardData.statusBuckets.map((item) => item.value), 1);
                    return (
                      <div key={bucket.label}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-300">{bucket.label}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{bucket.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-white/8">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.max((bucket.value / maxValue) * 100, bucket.value ? 12 : 0)}%`,
                              backgroundColor: bucket.fill,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Surface>
            </div>
          </div>
        </Surface>

        <div className="grid gap-6">
          <Surface className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Przegląd operacyjny</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Najważniejsze proporcje dnia</p>
              </div>
              <TrendingUp className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-5 grid gap-4">
              <CircleIndicator
                value={dashboardData.completedOrders.length}
                total={orders.length}
                label="Domknięte realizacje"
                accent="#10b981"
                tone="border-emerald-200/70 bg-emerald-50/70 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
              />
              <CircleIndicator
                value={dashboardData.handoffOrders.length}
                total={dashboardData.activeOrders.length}
                label="Gotowe do przekazania"
                accent="#38bdf8"
                tone="border-sky-200/70 bg-sky-50/70 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200"
              />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/[0.03]">
                <p className="text-xs text-slate-500 dark:text-slate-400">Skuteczność</p>
                <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{dashboardData.completionRate}%</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/[0.03]">
                <p className="text-xs text-slate-500 dark:text-slate-400">Do wydania</p>
                <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{dashboardData.handoffRate}%</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/[0.03]">
                <p className="text-xs text-slate-500 dark:text-slate-400">Pilne</p>
                <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{dashboardData.urgentRate}%</p>
              </div>
            </div>
          </Surface>

          <Surface className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Najbliższe terminy</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">To warto mieć na radarze</p>
              </div>
              <Clock3 className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-6 space-y-3">
              {dashboardData.nextDeadlineOrders.length ? (
                dashboardData.nextDeadlineOrders.map((order) => (
                  <div key={order.id} className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{order.title}</p>
                        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{order.client_name || "Bez przypisanego klienta"}</p>
                      </div>
                      <PriorityBadge priority={order.priority} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <StatusBadge status={order.status} />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {format(order.deadlineDate, "d MMMM", { locale: pl })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                  Brak nadchodzących terminów z ustawioną datą.
                </div>
              )}
            </div>

            <Link
              to={createPageUrl("Orders")}
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
            >
              Otwórz pełną listę zleceń
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Surface>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={FileText}
          label="Aktywne zlecenia"
          value={dashboardData.activeOrders.length}
          tone="sky"
          href={createPageUrl("Orders")}
          caption="Wszystkie pozycje, które są jeszcze w toku realizacji."
        />
        <KpiCard
          icon={Printer}
          label="Do przekazania"
          value={dashboardData.handoffOrders.length}
          tone="emerald"
          href={createPageUrl("Handoff")}
          caption="Gotowe lub prawie gotowe do wydania klientowi."
        />
        <KpiCard
          icon={AlertTriangle}
          label="Wysoki priorytet"
          value={dashboardData.urgentOrders.length}
          tone="rose"
          caption="Rzeczy, które wymagają szybkiej reakcji zespołu."
        />
        <KpiCard
          icon={Users}
          label="Baza klientów"
          value={clients.length}
          tone="amber"
          href={createPageUrl("Clients")}
          caption="Liczba kontaktów, do których można wrócić bez szukania."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Surface className="p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Trend zleceń</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Nowe realizacje kontra zamknięte w ostatnich 6 miesiącach</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-900 dark:bg-white" />
                Utworzone
              </span>
              <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                Zakończone
              </span>
            </div>
          </div>

          <div className="mt-6 h-[290px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.monthlyTrend}>
                <defs>
                  <linearGradient id="createdFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f172a" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient id="completedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 18,
                    border: "1px solid rgba(148,163,184,0.18)",
                    background: "rgba(255,255,255,0.95)",
                    boxShadow: "0 24px 70px -40px rgba(15,23,42,0.35)",
                  }}
                />
                <Area type="monotone" dataKey="created" stroke="#0f172a" strokeWidth={2.5} fill="url(#createdFill)" />
                <Area type="monotone" dataKey="completed" stroke="#38bdf8" strokeWidth={2.5} fill="url(#completedFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Surface>

        <Surface className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Mapa statusów</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Jak rozkładają się zlecenia</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-white/8 dark:text-slate-400">
              {role === "admin" ? "admin view" : "team view"}
            </span>
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] xl:grid-cols-1">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.statusBuckets.filter((item) => item.value > 0)}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={4}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 18,
                      border: "1px solid rgba(148,163,184,0.18)",
                      background: "rgba(255,255,255,0.95)",
                      boxShadow: "0 24px 70px -40px rgba(15,23,42,0.35)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {dashboardData.statusBuckets.map((bucket) => (
                <div key={bucket.label} className="flex items-center justify-between rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: bucket.fill }} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{bucket.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Aktualna liczba pozycji</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-slate-950 dark:text-white">{bucket.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Surface>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Surface className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Szybkie podsumowanie</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Krótki stan systemu na ten moment</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-[24px] bg-slate-950 p-5 text-white dark:bg-white dark:text-slate-950">
              <p className="text-sm font-semibold">Produkcja pod kontrolą</p>
              <p className="mt-2 text-sm text-white/70 dark:text-slate-500">
                {dashboardData.activeOrders.length > 0
                  ? `${dashboardData.activeOrders.length} aktywnych zleceń, z czego ${dashboardData.handoffOrders.length} są już blisko finalizacji.`
                  : "Na ten moment nie ma aktywnych zleceń w obiegu."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Klienci</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{clients.length}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Zamknięte</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{dashboardData.completedOrders.length}</p>
              </div>
            </div>
          </div>
        </Surface>

        <Surface className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Ostatnie zlecenia</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Najnowsze pozycje w systemie</p>
            </div>
            <Link to={createPageUrl("Orders")} className="text-sm font-medium text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
              Wszystkie
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {dashboardData.recentOrders.length ? (
              dashboardData.recentOrders.map((order) => (
                <div key={order.id} className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{order.title}</p>
                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{order.client_name || "Bez klienta"}</p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={order.priority} />
                    <StatusBadge status={order.status} />
                    {order.created_at && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {format(new Date(order.created_at), "d MMM", { locale: pl })}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                Brak ostatnich zleceń do pokazania.
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <QuickAction
              title="Lista zleceń"
              description="Przejdź do widoku tabeli, kanbanu i kalendarza."
              href={createPageUrl("Orders")}
              accent="border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
            />
            <QuickAction
              title="Nowy wpis"
              description="Dodaj kolejne zlecenie bez szukania formularza."
              href={createPageUrl("OrderForm")}
              accent="border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
            />
          </div>
        </Surface>
      </div>
    </div>
  );
}
