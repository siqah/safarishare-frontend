import { useEffect, useState, useMemo } from "react";
import { LogOut, Car, DollarSign, Clock, CheckCircle } from "lucide-react";
import useAuth from "../../stores/authStore";
import MyRides from "./myRides";
import CreateRideForm from "./CreateRideForm";
import api from "../../lib/api";

interface Ride {
  _id: string;
  startLocation: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  price: number;
  status: string;
}

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "driver") return;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/ride/driver/rides");
        setRides(res.data.rides || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.role]);

  const completed = useMemo(() => rides.filter(r => r.status === "completed"), [rides]);
  const earnings = useMemo(() => completed.reduce((s, r) => s + r.price, 0), [completed]);
  const activeCount = useMemo(() => rides.filter(r => r.status === "active").length, [rides]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">
        <Header userName={user?.name} onLogout={logout} />

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Rides"
            value={rides.length}
            icon={<Car className="size-5" />}
            gradient="from-indigo-500 to-indigo-600"
          />
            <StatCard
            label="Completed"
            value={completed.length}
            icon={<CheckCircle className="size-5" />}
            gradient="from-emerald-500 to-emerald-600"
          />
          <StatCard
            label="Earnings"
            value={`$${earnings.toFixed(2)}`}
            icon={<DollarSign className="size-5" />}
            gradient="from-amber-500 to-amber-600"
          />
          <StatCard
            label="Active Rides"
            value={activeCount}
            icon={<Clock className="size-5" />}
            gradient="from-sky-500 to-sky-600"
          />
        </section>

        <Panel title="Create a Ride">
          <CreateRideForm onCreated={ride => setRides(r => [...r, ride])} />
        </Panel>

        <Panel title="My Rides">
          {loading ? <SkeletonTable /> : <MyRides />}
        </Panel>
      </div>

      {loading && (
        <div className="fixed bottom-4 right-4 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur px-4 py-2 text-xs font-medium shadow-lg text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-indigo-600" />
          </span>
          Loading rides...
        </div>
      )}
    </div>
  );
};

const Header = ({ userName, onLogout }: { userName?: string; onLogout: () => void }) => (
  <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 p-6 shadow-lg">
    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]" />
    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
          Driver Dashboard
        </h1>
        <p className="text-indigo-100 text-sm mt-1">
          Manage rides, track performance, optimize earnings.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className="block text-sm font-semibold text-white">{userName}</span>
          <span className="text-[11px] uppercase tracking-wide font-medium text-indigo-100">
            Driver
          </span>
        </div>
        <button
          onClick={onLogout}
          className="group flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25 active:scale-[0.97]"
        >
          <LogOut className="size-4 transition group-hover:rotate-6" />
          Logout
        </button>
      </div>
    </div>
  </header>
);

const StatCard = ({
  label,
  value,
  icon,
  gradient
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
}) => (
  <div className="group relative rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-5 py-4 shadow-sm hover:shadow-md transition overflow-hidden">
    <div
      className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${gradient} transition`}
    />
    <div className="flex items-center gap-4">
      <div
        className={`flex size-11 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-inner shadow-black/20`}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">
          {label}
        </span>
        <span className="text-lg font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
          {value}
        </span>
      </div>
    </div>
    <div className="absolute right-3 top-3 h-6 w-6 rounded-full bg-slate-100/0 group-hover:bg-slate-100/50 dark:group-hover:bg-white/5 transition" />
  </div>
);

const Panel = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
    <div className="absolute -right-10 -top-10 size-32 rounded-full bg-indigo-100 dark:bg-indigo-500/10 blur-2xl opacity-40 pointer-events-none" />
    <h2 className="mb-5 text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100">
      {title}
    </h2>
    <div className="relative">{children}</div>
  </section>
);

const SkeletonTable = () => (
  <div className="space-y-3">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="h-12 w-full rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse"
      />
    ))}
  </div>
);

export default DriverDashboard;