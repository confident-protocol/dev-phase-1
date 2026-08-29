import { useMemo, useState } from "react";
import { useApiData } from "@/lib/useApiData";
import { motion } from "framer-motion";
import { Search, Plus, Mail, Wallet, Shield, Briefcase, Check, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { fmtUSD, truncAddr } from "@/lib/format";
import { GlassCard, PageHeader, StatusBadge, ChainBadge } from "@/components/layout/Primitives";

type Filter = "all" | "active" | "pending" | "inactive";

export default function EmployeesPage() {
  const { data, reload, isLoading } = useApiData<any[]>("/api/employees", (payload) => payload.items ?? []);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Engineer",
    salary: "8000",
    chain: "BNB",
    wallet: "",
  });

  const employees = useMemo(() => {
    const list = data ?? [];
    return list.filter((e) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        e.name?.toLowerCase().includes(q) ||
        e.role?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q);
      const matchesFilter = filter === "all" ? true : e.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [data, search, filter]);

  async function addEmployee() {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      const res = await api.post("/api/employees", {
        name: form.name,
        email: form.email || undefined,
        role: form.role,
        salary: Number(form.salary) || 0,
        chain: form.chain,
        wallet: form.wallet || undefined,
        status: "pending",
      });
      toast.success(`Added ${res.data?.employee?.name ?? form.name}`);
      setShowAdd(false);
      setForm({ name: "", email: "", role: "Engineer", salary: "8000", chain: "BNB", wallet: "" });
      reload();
    } catch {
      toast.error("Could not add employee");
    }
  }

  async function approve(id: string) {
    setBusyId(id);
    try {
      await api.post(`/api/employees/${id}/approve`);
      toast.success("Employee approved");
      reload();
    } catch {
      toast.error("Approve failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      await api.delete(`/api/employees/${id}`);
      toast.success("Employee removed");
      setSelected(null);
      reload();
    } catch {
      toast.error("Remove failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        subtitle="Manage payroll recipients, wallet addresses, and compliance status."
        actions={
          <button onClick={() => setShowAdd(true)} className="btn-primary px-4 py-2 text-sm">
            <Plus className="h-4 w-4" /> Add Employee
          </button>
        }
      />

      <GlassCard>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees"
              className="w-full rounded-xl border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["all", "All"],
                ["active", "Active"],
                ["pending", "Pending"],
                ["inactive", "Inactive"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                  filter === key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {employees.map((employee: any) => (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-background/50 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground">
                    {employee.name?.[0] ?? "?"}
                  </div>
                  <div>
                    <h4 className="font-semibold">{employee.name}</h4>
                    <p className="text-xs text-muted-foreground">{employee.role}</p>
                  </div>
                </div>
                <ChainBadge chain={employee.chain ?? "BNB"} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </div>
                  <p className="mt-1 truncate text-sm font-medium">{employee.email ?? "—"}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Wallet className="h-3.5 w-3.5" /> Wallet
                  </div>
                  <p className="mt-1 text-sm font-medium">{truncAddr(employee.wallet)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatusBadge status={employee.status} />
                <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground">
                  <Briefcase className="h-3 w-3" /> {employee.role}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground">
                  <Shield className="h-3 w-3" /> {employee.status === "active" ? "Roster ready" : "Needs review"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-card p-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Salary</p>
                  <p className="text-lg font-semibold">{fmtUSD(employee.salary)}</p>
                </div>
                <div className="flex gap-2">
                  {employee.status === "pending" && (
                    <button
                      disabled={busyId === employee.id}
                      onClick={() => approve(employee.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-sm font-semibold hover:bg-muted disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => setSelected(employee)}
                    className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-sm font-semibold hover:bg-muted"
                  >
                    View
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {!isLoading && !employees.length && (
          <p className="py-10 text-center text-sm text-muted-foreground">No employees match this filter.</p>
        )}
      </GlassCard>

      {showAdd && (
        <Modal title="Add employee" onClose={() => setShowAdd(false)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
            <Field label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
            <Field label="Role" value={form.role} onChange={(v) => setForm((f) => ({ ...f, role: v }))} />
            <Field label="Salary" value={form.salary} onChange={(v) => setForm((f) => ({ ...f, salary: v }))} />
            <label className="block text-sm sm:col-span-1">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Chain</span>
              <select
                value={form.chain}
                onChange={(e) => setForm((f) => ({ ...f, chain: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              >
                {["BNB", "ETH", "SOL", "BASE"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <Field label="Wallet (optional)" value={form.wallet} onChange={(v) => setForm((f) => ({ ...f, wallet: v }))} />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">
              Cancel
            </button>
            <button onClick={addEmployee} className="btn-primary px-4 py-2 text-sm">
              Create employee
            </button>
          </div>
        </Modal>
      )}

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Role:</span> {selected.role}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span> {selected.email}
            </p>
            <p>
              <span className="text-muted-foreground">Wallet:</span> {selected.wallet}
            </p>
            <p>
              <span className="text-muted-foreground">Salary:</span> {fmtUSD(selected.salary)}
            </p>
            <p>
              <span className="text-muted-foreground">Status:</span> {selected.status}
            </p>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            {selected.status === "pending" && (
              <button
                disabled={busyId === selected.id}
                onClick={() => approve(selected.id)}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
              >
                Approve
              </button>
            )}
            <button
              disabled={busyId === selected.id}
              onClick={() => remove(selected.id)}
              className="inline-flex items-center gap-1 rounded-xl border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/25 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-elegant">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
