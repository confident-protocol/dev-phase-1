import { useApiData } from "@/lib/useApiData";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Check,
  ChevronRight,
  Calendar,
  Lock,
  Zap,
  Shield,
  Plus,
  Edit,
  Copy,
  Trash2,
  Download,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { fmtUSD, fmtNum, relTime } from "@/lib/format";
import { GlassCard, PageHeader, ChainBadge, StatusBadge } from "@/components/layout/Primitives";

const TABS = ["Run Payroll", "Scheduled", "History", "Templates"] as const;

export default function PayrollPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Run Payroll");

  return (
    <div className="space-y-6">
      <PageHeader title="Payroll" subtitle="Run, schedule, and template private payrolls." />

      <div className="glass inline-flex rounded-xl border border-glass-border p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Run Payroll" && <RunPayroll />}
      {tab === "Scheduled" && <Scheduled />}
      {tab === "History" && <History />}
      {tab === "Templates" && <Templates />}
    </div>
  );
}

function RunPayroll() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [chain, setChain] = useState("BNB");
  const [privacy, setPrivacy] = useState("high");
  const [gas, setGas] = useState("fast");
  const [search, setSearch] = useState("");

  const employees = useApiData<any[]>("/api/payroll/employees", (payload) => payload.items ?? []);

  const filtered = (employees.data ?? []).filter(
    (e: any) => e.name.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedItems = (employees.data ?? []).filter((e: any) => selected.includes(e.id));
  const totalSalary = selectedItems.reduce((s: number, e: any) => s + e.salary, 0);
  const gasFee = gas === "fast" ? 12.5 : gas === "normal" ? 6.5 : 2.5;

  async function execute() {
    try {
      await api.post("/api/payroll/execute", { employeeIds: selected, chain, privacy });
      toast.success("Payroll executed — ZK proof generated 🛡️");
      setStep(0);
      setSelected([]);
    } catch {
      toast.error("Execution failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {['Select', 'Configure', 'Review'].map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div
              className={`grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-semibold transition ${
                i === step ? "border-primary bg-primary text-primary-foreground" : i < step ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
            {i < 2 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employees…"
                className="w-full rounded-lg border border-border bg-input/40 py-2 pl-10 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {selected.length} of {filtered.length} selected · {fmtUSD(totalSalary)}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
                  <th className="pb-2">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selected.length === filtered.length}
                      onChange={(e) => setSelected(e.target.checked ? filtered.map((x: any) => x.id) : [])}
                      className="accent-[var(--primary)]"
                    />
                  </th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Salary</th>
                  <th className="pb-2">Chain</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e: any) => (
                  <tr key={e.id} className="border-b border-border/60 hover:bg-muted/30">
                    <td className="py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(e.id)}
                        onChange={(ev) => setSelected(ev.target.checked ? [...selected, e.id] : selected.filter((x) => x !== e.id))}
                        className="accent-[var(--primary)]"
                      />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-primary text-[10px] font-semibold text-primary-foreground">
                          {e.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{e.name}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{e.wallet.slice(0, 10)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">{e.role}</td>
                    <td className="py-3 font-medium">{fmtUSD(e.salary)}</td>
                    <td className="py-3"><ChainBadge chain={e.chain} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end">
            <button disabled={selected.length === 0} onClick={() => setStep(1)} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">
              Continue ({selected.length})
            </button>
          </div>
        </GlassCard>
      )}

      {step === 1 && (
        <GlassCard>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Select label="Source Chain" value={chain} onChange={setChain} options={["BNB", "ETH", "SOL", "BASE"]} />
              <Select label="Payment Token" value="USDC" onChange={() => {}} options={["USDC", "USDT", "DAI"]} />
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">Gas Settings</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: "fast", label: "⚡ Fast", sub: "$12.50" },
                    { k: "normal", label: "Normal", sub: "$6.50" },
                    { k: "slow", label: "Slow", sub: "$2.50" },
                  ].map((g) => (
                    <button key={g.k} onClick={() => setGas(g.k)} className={`rounded-lg border px-3 py-2 text-xs ${gas === g.k ? "border-primary bg-primary/10" : "border-border bg-card/40"}`}>
                      <p className="font-medium">{g.label}</p>
                      <p className="text-muted-foreground">{g.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">Privacy Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: "high", icon: Lock, label: "High" },
                    { k: "medium", icon: Shield, label: "Medium" },
                    { k: "low", icon: Zap, label: "Low" },
                  ].map((p) => (
                    <button key={p.k} onClick={() => setPrivacy(p.k)} className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs ${privacy === p.k ? "border-primary bg-primary/10" : "border-border bg-card/40"}`}>
                      <p.icon className="h-3.5 w-3.5" /> {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/40 p-5">
              <h4 className="text-sm font-semibold">Summary</h4>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Employees" value={fmtNum(selectedItems.length)} />
                <Row label="Base Salaries" value={fmtUSD(totalSalary)} />
                <Row label="Gas Fees" value={fmtUSD(gasFee)} />
                <Row label="Platform Fee" value="$0.00" sub="Beta" />
                <div className="my-2 h-px bg-border" />
                <Row label="Total" value={fmtUSD(totalSalary + gasFee)} strong />
              </dl>
              <div className="mt-4 space-y-2 text-xs">
                <p className="flex items-center gap-2 text-success"><Check className="h-3.5 w-3.5" /> ZK Proof Ready</p>
                <p className="flex items-center gap-2 text-success"><Check className="h-3.5 w-3.5" /> Audit Trail Ready</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(0)} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
            <button onClick={() => setStep(2)} className="btn-primary px-5 py-2.5 text-sm">Review Payroll</button>
          </div>
        </GlassCard>
      )}

      {step === 2 && (
        <GlassCard className="text-center">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="mx-auto max-w-md">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary">
              <Lock className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">Confirm Payroll Execution</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedItems.length} employees · {fmtUSD(totalSalary + gasFee)} total · {chain}
            </p>
            <div className="mt-6 space-y-2 rounded-xl border border-border bg-card/40 p-4 text-left text-sm">
              <Row label="Employees" value={`${selectedItems.length}`} />
              <Row label="Total" value={fmtUSD(totalSalary + gasFee)} strong />
              <Row label="Privacy" value={privacy.toUpperCase()} />
              <Row label="Gas" value={gas.toUpperCase()} />
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setStep(1)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm">← Back</button>
              <button onClick={execute} className="btn-primary px-5 py-2.5 text-sm">
                <Lock className="h-4 w-4" /> Execute Payroll
              </button>
            </div>
          </motion.div>
        </GlassCard>
      )}
    </div>
  );
}

function Row({ label, value, strong, sub }: { label: string; value: string; strong?: boolean; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? "text-lg font-bold" : "font-medium"}>
        {value} {sub && <span className="text-[10px] text-muted-foreground">({sub})</span>}
      </dd>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-border bg-input/40 px-3 py-2 text-sm outline-none focus:border-primary">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Scheduled() {
  const { data, reload } = useApiData<any[]>("/api/payroll/scheduled", (payload) => payload.items ?? []);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function scheduleNew() {
    try {
      await api.post("/api/payroll/scheduled", {
        employees: 8,
        amount: 28100,
        chain: "BNB",
        destChain: "ETH",
        template: "Custom schedule",
        date: new Date(Date.now() + 3 * 86400000).toISOString(),
      });
      toast.success("Payroll scheduled");
      reload();
    } catch {
      toast.error("Could not schedule payroll");
    }
  }

  async function runNow(item: any) {
    setBusyId(item.id);
    try {
      await api.post("/api/payroll/execute", {
        employeeIds: item.employeeIds ?? [],
        chain: item.chain,
        privacy: item.privacy || "high",
      });
      toast.success("Scheduled payroll executed");
      reload();
    } catch {
      toast.error("Run failed");
    } finally {
      setBusyId(null);
    }
  }

  async function cancel(id: string) {
    setBusyId(id);
    try {
      await api.post(`/api/payroll/scheduled/${id}/cancel`);
      toast.success("Schedule cancelled");
      reload();
    } catch {
      toast.error("Cancel failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      await api.delete(`/api/payroll/scheduled/${id}`);
      toast.success("Schedule removed");
      reload();
    } catch {
      toast.error("Remove failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">Scheduled Payrolls</h3>
        <button onClick={scheduleNew} className="btn-primary px-3 py-1.5 text-xs">
          <Plus className="h-3 w-3" /> Schedule new
        </button>
      </div>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <th className="pb-2">Date</th>
            <th className="pb-2">Template</th>
            <th className="pb-2">Employees</th>
            <th className="pb-2">Amount</th>
            <th className="pb-2">Chain</th>
            <th className="pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((s: any) => (
            <tr key={s.id} className="border-b border-border/60 hover:bg-muted/30">
              <td className="py-3">
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {new Date(s.date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </td>
              <td className="py-3">{s.template}</td>
              <td className="py-3">{s.employees}</td>
              <td className="py-3 font-medium">{fmtUSD(s.amount)}</td>
              <td className="py-3"><ChainBadge chain={s.chain} /></td>
              <td className="py-3">
                <div className="flex gap-1">
                  <button
                    disabled={busyId === s.id || s.status === "cancelled"}
                    onClick={() => runNow(s)}
                    className="rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    Run
                  </button>
                  <button
                    disabled={busyId === s.id}
                    onClick={() => cancel(s.id)}
                    className="rounded p-1 hover:bg-muted disabled:opacity-50"
                    title="Cancel"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={busyId === s.id}
                    onClick={() => remove(s.id)}
                    className="rounded p-1 hover:bg-destructive/20 hover:text-destructive disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
}

function History() {
  const { data } = useApiData<any[]>("/api/payroll/history", (payload) => payload.items ?? []);

  function exportCsv() {
    const rows = data ?? [];
    const csv = [
      "id,amount,employees,chain,status,date",
      ...rows.map((t: any) => [t.id, t.amount, t.employees, t.chain, t.status, t.date].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("History exported");
  }

  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">Payroll History</h3>
        <button onClick={exportCsv} className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted">
          <Download className="h-3 w-3" /> Export
        </button>
      </div>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
            <th className="pb-2">Tx</th>
            <th className="pb-2">Amount</th>
            <th className="pb-2">Employees</th>
            <th className="pb-2">Chain</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">When</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((t: any) => (
            <tr key={t.id} className="border-b border-border/60 hover:bg-muted/30">
              <td className="py-3 font-mono text-xs">{t.id}</td>
              <td className="py-3 font-medium">{fmtUSD(t.amount)}</td>
              <td className="py-3">{t.employees}</td>
              <td className="py-3"><ChainBadge chain={t.chain} /></td>
              <td className="py-3"><StatusBadge status={t.status} /></td>
              <td className="py-3 text-xs text-muted-foreground">{relTime(t.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
}

function Templates() {
  const { data, reload } = useApiData<any[]>("/api/payroll/templates", (payload) => payload.items ?? []);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function createTemplate() {
    try {
      await api.post("/api/payroll/templates", {
        name: `Template ${new Date().toLocaleDateString()}`,
        employees: 5,
        amount: 19500,
        chain: "BNB",
      });
      toast.success("Template created");
      reload();
    } catch {
      toast.error("Could not create template");
    }
  }

  async function runTemplate(t: any) {
    setBusyId(t.id);
    try {
      await api.post("/api/payroll/execute", {
        employeeIds: t.employeeIds ?? [],
        chain: t.chain,
        privacy: t.privacy || "high",
        templateId: t.id,
      });
      toast.success(`Ran ${t.name}`);
      reload();
    } catch {
      toast.error("Template run failed");
    } finally {
      setBusyId(null);
    }
  }

  async function duplicate(t: any) {
    try {
      await api.post("/api/payroll/templates", {
        name: `${t.name} (copy)`,
        employees: t.employees,
        amount: t.amount,
        chain: t.chain,
        employeeIds: t.employeeIds ?? [],
      });
      toast.success("Template duplicated");
      reload();
    } catch {
      toast.error("Duplicate failed");
    }
  }

  async function rename(t: any) {
    const name = window.prompt("Rename template", t.name);
    if (!name) return;
    try {
      await api.put(`/api/payroll/templates/${t.id}`, { name });
      toast.success("Template updated");
      reload();
    } catch {
      toast.error("Update failed");
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(data ?? []).map((t: any) => (
        <GlassCard key={t.id}>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold">{t.name}</h4>
              <p className="text-xs text-muted-foreground">{t.employees} employees · {fmtUSD(t.amount)}</p>
            </div>
            <ChainBadge chain={t.chain} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Last used: {t.lastUsed || "—"}</p>
          <div className="mt-4 flex gap-2">
            <button
              disabled={busyId === t.id}
              onClick={() => runTemplate(t)}
              className="btn-primary flex-1 py-2 text-xs disabled:opacity-50"
            >
              Run
            </button>
            <button onClick={() => rename(t)} className="rounded-xl border border-border bg-card p-2 hover:bg-muted" title="Rename">
              <Edit className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => duplicate(t)} className="rounded-xl border border-border bg-card p-2 hover:bg-muted" title="Duplicate">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </GlassCard>
      ))}
      <GlassCard className="grid place-items-center border-dashed text-center text-muted-foreground hover:text-foreground">
        <button onClick={createTemplate} className="inline-flex flex-col items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-dashed border-border">
            <Plus className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold">New Template</span>
        </button>
      </GlassCard>
    </div>
  );
}
