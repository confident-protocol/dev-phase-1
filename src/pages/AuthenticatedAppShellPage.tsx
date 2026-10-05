import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Banknote,
  Users,
  Wallet,
  ShieldCheck,
  ArrowLeftRight,
  Settings as SettingsIcon,
  HelpCircle,
  Menu,
  Search,
  Bell,
  Copy,
  LogOut,
  Plus,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { truncAddr, relTime } from "@/lib/format";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/payroll", label: "Payroll", icon: Banknote },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/treasury", label: "Treasury", icon: Wallet },
  { to: "/compliance", label: "Compliance", icon: ShieldCheck },
  { to: "/bridge", label: "Bridge", icon: ArrowLeftRight },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

const DEMO_WALLET = "0x7f3eA4b21cD9f08B5a6c11E0B23F8a9D4cE7b210";

type Notice = {
  id: string;
  title: string;
  message: string;
  createdAt?: string;
  read?: boolean;
};

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
          <path d="M12 3 4 7v5c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V7l-8-4Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p className="font-display text-sm font-bold leading-tight tracking-tight">ConfidentialPay</p>
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">MVP workspace</p>
      </div>
    </div>
  );
}

export default function AuthenticatedAppShellPage({ children }: { children?: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [search, setSearch] = useState("");
  const location = useLocation();
  const pathname = location.pathname;
  const unread = notices.filter((n) => !n.read).length;

  useEffect(() => {
    api
      .get("/api/notifications")
      .then((res) => setNotices(res.data?.items ?? []))
      .catch(() => setNotices([]));
  }, []);

  function runSearch(event: React.FormEvent) {
    event.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;
    if (q.includes("employee") || q.includes("people")) {
      navigate("/employees");
      return;
    }
    if (q.includes("payroll") || q.includes("pay")) {
      navigate("/payroll");
      return;
    }
    if (q.includes("treasury") || q.includes("balance")) {
      navigate("/treasury");
      return;
    }
    if (q.includes("compliance") || q.includes("kyc") || q.includes("aml")) {
      navigate("/compliance");
      return;
    }
    if (q.includes("bridge") || q.includes("swap")) {
      navigate("/bridge");
      return;
    }
    toast.success(`Searching workspace for “${search.trim()}”`);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 -translate-x-full border-r border-sidebar-border bg-sidebar transition-transform lg:relative lg:translate-x-0 ${
          open ? "translate-x-0" : ""
        }`}
      >
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Link to="/dashboard">
            <BrandMark />
          </Link>
        </div>

        <nav className="space-y-1 p-3">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute inset-x-3 bottom-3 space-y-2">
          <button
            type="button"
            onClick={() => toast("Email support@confidentialpay.com · docs in Settings")}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-sidebar-accent"
          >
            <HelpCircle className="h-4 w-4" /> Help & Support
          </button>
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                {(user?.name ?? "A")[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{user?.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-[2px] lg:hidden" />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-6">
          <button className="rounded-xl p-2 hover:bg-muted lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>

          <form onSubmit={runSearch} className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees, transactions…"
              className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              ⌘K
            </kbd>
          </form>

          <div className="flex-1 md:hidden" />

          <div className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-soft-pulse rounded-full bg-success opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span style={{ color: "var(--chain-bnb)" }}>BNB Chain</span>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(DEMO_WALLET);
              toast.success("Address copied");
            }}
            className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 font-mono text-xs hover:bg-muted md:flex"
          >
            {truncAddr(DEMO_WALLET)}
            <Copy className="h-3 w-3" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen((v) => !v);
                setUserMenu(false);
              }}
              className="relative rounded-xl p-2 hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />}
            </button>
            {notifOpen && (
              <div
                onMouseLeave={() => setNotifOpen(false)}
                className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-2 shadow-elegant"
              >
                <div className="flex items-center justify-between px-2 py-1.5">
                  <p className="text-sm font-semibold">Notifications</p>
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-primary"
                    onClick={() => setNotices((items) => items.map((n) => ({ ...n, read: true })))}
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 space-y-1 overflow-y-auto">
                  {notices.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        setNotices((items) => items.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                        toast.success(n.title);
                      }}
                      className={`w-full rounded-lg px-2.5 py-2 text-left hover:bg-muted ${n.read ? "opacity-70" : ""}`}
                    >
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                      {n.createdAt && <p className="mt-1 text-[10px] text-muted-foreground">{relTime(n.createdAt)}</p>}
                    </button>
                  ))}
                  {!notices.length && <p className="px-2 py-4 text-center text-xs text-muted-foreground">No notifications yet.</p>}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/payroll"
            className="hidden items-center gap-1 rounded-xl bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground sm:flex"
          >
            <Plus className="h-4 w-4" /> Run payroll
          </Link>

          <div className="relative">
            <button
              onClick={() => {
                setUserMenu((s) => !s);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5 hover:bg-muted"
            >
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                {(user?.name ?? "A")[0]}
              </div>
              <ChevronDown className="hidden h-3 w-3 sm:block" />
            </button>
            {userMenu && (
              <div
                onMouseLeave={() => setUserMenu(false)}
                className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-1 shadow-elegant"
              >
                <div className="border-b border-border px-3 py-2">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <NavLink to="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                  <SettingsIcon className="h-4 w-4" /> Settings
                </NavLink>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
