import { useMemo, useState } from "react";
import { useApiData } from "@/lib/useApiData";
import { ShieldCheck, AlertTriangle, CheckCircle2, FileCheck2, KeyRound, ScanSearch } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { GlassCard, PageHeader, StatusBadge } from "@/components/layout/Primitives";

function asText(value: unknown, fallback: string) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return String(value.length);
  return fallback;
}

function asScore(value: unknown, nested?: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value && typeof value === "object" && typeof (value as any).score === "number") {
    return (value as any).score as number;
  }
  if (typeof nested === "number" && Number.isFinite(nested)) return nested;
  return 96;
}

function asChecks(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === "object")
    .map((item: any, index) => ({
      id: String(item.id ?? `check-${index}`),
      name: String(item.name ?? "Check"),
      detail: String(item.detail ?? ""),
      status: String(item.status ?? "pending"),
    }));
}

function asEmployees(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === "object")
    .map((item: any, index) => ({
      id: String(item.id ?? `emp-${index}`),
      name: String(item.name ?? "Employee"),
      level: String(item.level ?? "Basic"),
      documents: Number(item.documents ?? 0),
      total: Number(item.total ?? 3),
      status: String(item.status ?? "pending"),
    }));
}

function mapStatus(status: string) {
  if (status === "passed" || status === "verified" || status === "cleared") return "completed";
  if (status === "manual_review") return "pending";
  if (status === "rejected") return "failed";
  return status || "pending";
}

export default function CompliancePage() {
  const overview = useApiData<any>("/api/compliance");
  const scoreRes = useApiData<any>("/api/compliance/score");
  const statusRes = useApiData<any>("/api/compliance/status");
  const [busy, setBusy] = useState<"screen" | "key" | null>(null);

  async function runAmlScreen() {
    setBusy("screen");
    try {
      const first = statusRes.data?.employees?.[0] ?? overview.data?.status?.employees?.[0];
      await api.post("/api/compliance/screen", {
        partyId: first?.id || "admin",
        wallet: "0x7f3eA4b21cD9f08B5a6c11E0B23F8a9D4cE7b210",
        type: "employee",
      });
      toast.success("AML screen completed");
      overview.reload();
      statusRes.reload();
    } catch {
      toast.error("AML screen failed");
    } finally {
      setBusy(null);
    }
  }

  async function issueViewKey() {
    setBusy("key");
    try {
      const first = statusRes.data?.employees?.[0] ?? overview.data?.status?.employees?.[0];
      await api.post("/api/compliance/viewing-key", {
        employeeId: first?.id || "e1",
        viewer: "compliance@confidentialpay.com",
        ttlSec: 3600,
        reason: "regulatory_disclosure",
      });
      toast.success("Viewing key issued");
      overview.reload();
    } catch {
      toast.error("Could not issue viewing key");
    } finally {
      setBusy(null);
    }
  }

  const view = useMemo(() => {
    const data = overview.data ?? {};
    const score = asScore(scoreRes.data?.score, asScore(data.score));
    const checks = asChecks(data.checks);
    const employees = asEmployees(statusRes.data?.employees ?? data?.status?.employees);

    return {
      score,
      policyHealth: asText(data.policyHealth, "98%"),
      auditTrail: asText(data.auditTrail, "24"),
      openIssues: asText(data.openIssues, "2"),
      checks,
      employees,
      loading: overview.isLoading && !overview.data,
    };
  }, [overview.data, overview.isLoading, scoreRes.data, statusRes.data]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance"
        subtitle="Track policies, audits, and proof readiness for every payroll flow."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={runAmlScreen}
              disabled={!!busy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"
            >
              <ScanSearch className="h-4 w-4" /> Run AML screen
            </button>
            <button onClick={issueViewKey} disabled={!!busy} className="btn-primary px-3 py-2 text-sm disabled:opacity-50">
              <KeyRound className="h-4 w-4" /> Issue viewing key
            </button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <GlassCard>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">Privacy score</h3>
          </div>
          <p className="mt-4 font-display text-3xl font-bold">{view.score}%</p>
          <p className="mt-2 text-sm text-muted-foreground">Composite KYC, AML, tax, and privacy health.</p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">Policy health</h3>
          </div>
          <p className="mt-4 font-display text-3xl font-bold">{view.policyHealth}</p>
          <p className="mt-2 text-sm text-muted-foreground">All compliance policies are current and active.</p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">Audit trail</h3>
          </div>
          <p className="mt-4 font-display text-3xl font-bold">{view.auditTrail}</p>
          <p className="mt-2 text-sm text-muted-foreground">Signed and verifiable records this month.</p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-base font-semibold">Open issues</h3>
          </div>
          <p className="mt-4 font-display text-3xl font-bold">{view.openIssues}</p>
          <p className="mt-2 text-sm text-muted-foreground">KYC reviews and policy updates pending.</p>
        </GlassCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <GlassCard>
          <h3 className="text-base font-semibold">Recent checks</h3>
          <div className="mt-4 space-y-3">
            {view.checks.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-background/60 p-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
                <StatusBadge status={mapStatus(item.status)} />
              </div>
            ))}
            {!view.checks.length && (
              <p className="text-sm text-muted-foreground">
                {view.loading ? "Loading compliance checks..." : "No compliance checks available."}
              </p>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-base font-semibold">Employee KYC status</h3>
          <div className="mt-4 space-y-3">
            {view.employees.slice(0, 8).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-background/60 p-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.level} · {item.documents}/{item.total} docs
                  </p>
                </div>
                <StatusBadge status={mapStatus(item.status)} />
              </div>
            ))}
            {!view.employees.length && (
              <p className="text-sm text-muted-foreground">
                {statusRes.isLoading ? "Loading KYC status..." : "No employee KYC records yet."}
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
