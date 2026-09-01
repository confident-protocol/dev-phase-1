import { useEffect, useState } from "react";
import { useApiData } from "@/lib/useApiData";
import { Building2, Users, Shield, Save } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { GlassCard, PageHeader } from "@/components/layout/Primitives";

export default function SettingsPage() {
  const settings = useApiData<any>("/api/settings");
  const team = useApiData<any[]>("/api/settings/team", (payload) => payload.items ?? []);
  const [company, setCompany] = useState("");
  const [defaultChain, setDefaultChain] = useState("BNB");
  const [privacyLevel, setPrivacyLevel] = useState("high");
  const [timezone, setTimezone] = useState("UTC-5");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings.data) return;
    setCompany(settings.data.company ?? "ConfidentialPay Inc");
    setDefaultChain(settings.data.defaultChain ?? "BNB");
    setPrivacyLevel(settings.data.privacyLevel ?? "high");
    setTimezone(settings.data.timezone ?? "UTC-5");
  }, [settings.data]);

  async function save() {
    setSaving(true);
    try {
      await api.put("/api/settings", { company, defaultChain, privacyLevel, timezone });
      toast.success("Settings saved");
      settings.reload();
    } catch {
      toast.error("Could not save settings");
    } finally {
      setSaving(false);
    }
  }

  async function invite() {
    try {
      await api.post("/api/settings/team", {
        name: "New Operator",
        email: `ops-${Date.now().toString(36)}@confidentialpay.com`,
        role: "Viewer",
      });
      toast.success("Team invite created");
      team.reload();
    } catch {
      toast.error("Invite failed");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Workspace configuration, privacy defaults, and team access."
        actions={
          <button onClick={save} disabled={saving} className="btn-primary px-4 py-2 text-sm disabled:opacity-60">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">Workspace</h3>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Company</span>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Default chain</span>
              <select
                value={defaultChain}
                onChange={(e) => setDefaultChain(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {["BNB", "ETH", "SOL", "BASE"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Privacy level</span>
              <select
                value={privacyLevel}
                onChange={(e) => setPrivacyLevel(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="standard">Standard</option>
                <option value="high">High</option>
                <option value="maximum">Maximum</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Timezone</span>
              <input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Protocol defaults</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {settings.data?.protocol ?? "ConfidentialPay"} {settings.data?.version ?? ""} · fee default{" "}
              {settings.data?.feeBpsDefault ?? 45} bps
            </p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Team</h3>
            </div>
            <button onClick={invite} className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
              Invite
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {(team.data ?? []).map((member: any) => (
              <div key={member.id} className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-3">
                <div>
                  <p className="text-sm font-semibold">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
                <span className="rounded-md bg-secondary px-2 py-1 text-[11px] font-semibold">{member.role}</span>
              </div>
            ))}
            {!team.data?.length && !team.isLoading && (
              <p className="text-sm text-muted-foreground">No team members loaded.</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
