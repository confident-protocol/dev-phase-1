import { useState } from "react";
import { Link } from "react-router-dom";
import { useApiData } from "@/lib/useApiData";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  Activity,
  ShieldCheck,
  ArrowUpRight,
  Play,
  Plus,
  ArrowLeftRight,
  Calendar,
  Download,
} from "lucide-react";
import { api } from "@/lib/api";
import { fmtUSD, fmtNum, relTime, truncAddr } from "@/lib/format";
import { GlassCard, PageHeader, ChainBadge, StatusBadge } from "@/components/layout/Primitives";
import toast from "react-hot-toast";

const breakdownColors = ["var(--success)", "var(--warning)", "var(--muted-foreground)"];
const chainColors = ["var(--chain-bnb)", "var(--chain-eth)", "var(--chain-sol)", "var(--chain-base)"];

export default function DashboardPage() {
  const [range, setRange] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const stats = useApiData<any>("/api/dashboard/stats");
  const txs = useApiData<any[]>("/api/dashboard/transactions", (payload) => payload.items ?? []);
  const activity = useApiData<any[]>(
    `/api/dashboard/payroll-activity?range=${range}`,
    (payload) => payload.series ?? [],
  );
  const upcoming = useApiData<any[]>("/api/dashboard/upcoming-payrolls", (payload) => payload.items ?? []);

  const s = stats.data;
  const breakdownData = s
    ? [
        { name: "Active", value: s.activeBreakdown.active },
        { name: "Pending", value: s.activeBreakdown.pending },
        { name: "Inactive", value: s.activeBreakdown.inactive },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back — here's what's happening across your treasury."
        actions={
          <Link to="/payroll" className="btn-primary px-4 py-2 text-sm shadow-elegant">
            <Play className="h-4 w-4" /> Run Payroll
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Total Payroll"
          value={s ? fmtUSD(s.totalPayroll) : "—"}
          delta={s ? `↑ ${s.payrollChange}% from last month` : ""}
          gradient="bg-gradient-primary"
          loading={stats.isLoading}
        >
          <Sparkline />
        </StatCard>

        <StatCard
          icon={Users}
          label="Active Employees"
          value={s ? fmtNum(s.activeEmployees) : "—"}
          delta={s ? `${s.activeBreakdown.active} active / ${s.activeBreakdown.pending} pending` : ""}
          gradient="bg-gradient-cyber"
          loading={stats.isLoading}
        >
          {s && (
            <ResponsiveContainer width="100%" height={56}>
              <PieChart>
                <Pie data={breakdownData} dataKey="value" innerRadius={16} outerRadius={26}>
                  {breakdownData.map((_, i) => (
                    <Cell key={i} fill={breakdownColors[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </StatCard>

        <StatCard
          icon={Activity}
          label="Cross-Chain Txns"
          value={s ? fmtNum(s.crossChainTransactions) : "—"}
          delta="this month"
          gradient="bg-gradient-mystic"
          loading={stats.isLoading}
        >
          {s && (
            <div className="space-y-1.5">
              {Object.entries(s.chainDistribution as Record<string, number>).map(([k, v], i) => (
                <div key={k} className="flex items-center gap-2 text-[10px]">
                  <span className="w-7 text-muted-foreground">{k}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${v}%`, background: chainColors[i] }} />
                  </div>
                  <span className="w-7 text-right text-muted-foreground">{v}%</span>
                </div>
              ))}
            </div>
          )}
        </StatCard>

        <StatCard
          icon={ShieldCheck}
          label="Privacy Shield"
          value={s ? `${s.privacyScore}%` : "—"}
          delta="ZK ✓  FHE ✓  Compliant ✓"
          gradient="bg-gradient-primary"
          loading={stats.isLoading}
        >
          {s && (
            <div className="relative h-14 w-14">
              <svg className="h-full w-full -rotate-90">
                <circle cx="28" cy="28" r="22" fill="none" stroke="oklch(1 0 0 / 0.1)" strokeWidth="5" />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="url(#g1)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${(s.privacyScore / 100) * 138} 999`}
                />
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--secondary)" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 grid place-items-center text-[10px] font-bold">{s.privacyScore}</span>
            </div>
          )}
        </StatCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Payroll Activity</h3>
              <p className="text-xs text-muted-foreground">Cross-chain payroll volume — {range}</p>
            </div>
            <div className="flex gap-1 rounded-lg border border-border bg-card p-1 text-xs">
              {([
                ["weekly", "Weekly"],
                ["monthly", "Monthly"],
                ["yearly", "Yearly"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setRange(key)}
                  className={`rounded-md px-2.5 py-1 font-semibold ${
                    range === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            {activity.data && (
              <ResponsiveContainer>
                <AreaChart data={activity.data}>
                  <defs>
                    {chainColors.map((c, i) => (
                      <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={c} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis dataKey="label" stroke="oklch(0.6 0.04 270)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.6 0.04 270)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ background: 'oklch(0.18 0.045 270)', border: '1px solid oklch(1 0 0 / 0.1)', borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number) => fmtUSD(v)}
                  />
                  <Area type="monotone" dataKey="BNB" stackId="1" stroke={chainColors[0]} fill="url(#grad0)" />
                  <Area type="monotone" dataKey="ETH" stackId="1" stroke={chainColors[1]} fill="url(#grad1)" />
                  <Area type="monotone" dataKey="SOL" stackId="1" stroke={chainColors[2]} fill="url(#grad2)" />
                  <Area type="monotone" dataKey="BASE" stackId="1" stroke={chainColors[3]} fill="url(#grad3)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 gap-3">
          <QuickAction icon={Play} title="Run Payroll" subtitle="3 scheduled" gradient to="/payroll" />
          <QuickAction icon={Plus} title="Add Employee" subtitle="147 total" to="/employees" />
          <QuickAction icon={ShieldCheck} title="Compliance" subtitle="All Good" to="/compliance" />
          <QuickAction icon={ArrowLeftRight} title="Bridge" subtitle="$1.2M ready" to="/bridge" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold">Recent Transactions</h3>
            <button
              onClick={() => {
                const rows = txs.data ?? [];
                const csv = [
                  "id,type,amount,status,chain,date",
                  ...rows.map((t: any) => [t.id, t.type, t.amount, t.status, t.chain, t.date].join(",")),
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `transactions-${Date.now()}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("CSV downloaded");
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              <Download className="h-3 w-3" /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Tx</th>
                  <th className="pb-2 pr-3 font-medium">Type</th>
                  <th className="pb-2 pr-3 font-medium">Amount</th>
                  <th className="pb-2 pr-3 font-medium">Status</th>
                  <th className="pb-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {(txs.data ?? []).map((t: any) => (
                  <tr key={t.id} className="border-b border-border/60 hover:bg-muted/30">
                    <td className="py-3 pr-3 font-mono text-xs">{t.id}</td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <ChainBadge chain={t.chain} />
                        <span className="text-muted-foreground">{t.type}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 font-medium">{fmtUSD(t.amount)}</td>
                    <td className="py-3 pr-3"><StatusBadge status={t.status} /></td>
                    <td className="py-3 text-xs text-muted-foreground">{relTime(t.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold">Upcoming Payrolls</h3>
            <Link to="/payroll" className="rounded-lg border border-border bg-card px-2 py-1 text-[10px] font-semibold hover:bg-muted">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {(upcoming.data ?? []).map((u: any) => (
              <div key={u.id} className="rounded-xl border border-border bg-card/40 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{u.name}</p>
                  <StatusBadge status={u.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{u.employees} employees · {fmtUSD(u.amount)}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Calendar className="h-3 w-3" /> {u.date}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, delta, gradient, loading, children }: any) {
  return (
    <GlassCard className="relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-1 ${gradient}`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{loading ? "—" : value}</p>
        </div>
        <div className="rounded-xl border border-border bg-card/40 p-2">
          <Icon className="h-4 w-4 text-secondary" />
        </div>
      </div>
      <div className="mt-4">{children}</div>
      {delta && <p className="mt-3 text-xs text-muted-foreground">{delta}</p>}
    </GlassCard>
  );
}

function QuickAction({ icon: Icon, title, subtitle, gradient, to }: any) {
  return (
    <Link to={to} className={`rounded-2xl border border-border bg-card/40 p-3 text-left ${gradient ? 'bg-gradient-primary/10' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground ">
          <Icon className="h-4 w-4" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-4 font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </Link>
  );
}

function Sparkline() {
  return (
    <div className="flex h-12 items-end gap-1">
      {[48, 62, 55, 72, 68, 80].map((h, i) => <div key={i} className="flex-1 rounded-full bg-gradient-primary/60" style={{ height: `${h}%` }} />)}
    </div>
  );
}

