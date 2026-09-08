import { useMemo, useState } from "react";
import { useApiData } from "@/lib/useApiData";
import { ArrowLeftRight, ShieldCheck, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { fmtUSD } from "@/lib/format";
import { GlassCard, PageHeader } from "@/components/layout/Primitives";

export default function BridgePage() {
  const { data, reload } = useApiData<any>("/api/bridge");
  const [fromChain, setFromChain] = useState("BNB");
  const [toChain, setToChain] = useState("ETH");
  const [amount, setAmount] = useState("50000");
  const [busy, setBusy] = useState<"preview" | "execute" | null>(null);
  const [preview, setPreview] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const displayHistory = useMemo(() => {
    const base = data?.history ?? [];
    return [...history, ...base];
  }, [data?.history, history]);

  async function runPreview() {
    setBusy("preview");
    try {
      const value = Number(amount) || 0;
      const quote = await api.post("/api/swap/quote", {
        fromAsset: "USDC",
        toAsset: "USDC",
        amount: value,
        chain: fromChain,
      });
      const next = {
        fromChain,
        toChain,
        amount: value,
        fee: Number((value * 0.0008).toFixed(4)),
        quoteId: quote.data?.quote?.quoteId,
        eta: "2–4 min",
      };
      setPreview(next);
      toast.success("Bridge preview ready");
    } catch {
      toast.error("Preview failed");
    } finally {
      setBusy(null);
    }
  }

  async function executeBridge() {
    setBusy("execute");
    try {
      const value = Number(amount) || 0;
      const burn = await api.post("/api/bridge/cctp/burn", {
        sourceChain: fromChain,
        destChain: toChain,
        amount: value,
        sender: "0xTreasury",
      });
      const burnId = burn.data?.burn?.burnId;
      if (burnId) {
        await api.post(`/api/bridge/cctp/${burnId}/attest`);
      }
      setHistory((prev) => [
        {
          id: burnId || `b_${Date.now()}`,
          label: `${fromChain} → ${toChain}`,
          status: "Processing",
          detail: `CCTP transfer of ${fmtUSD(value)} submitted`,
        },
        ...prev,
      ]);
      toast.success("Bridge executed");
      reload();
    } catch {
      toast.error("Bridge execution failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Bridge" subtitle="Move funds across chains while preserving privacy and auditability." />

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <GlassCard>
          <div className="rounded-2xl border border-border bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Bridge funds</p>
                <p className="text-sm text-muted-foreground">Secure CCTP transfer between supported chains</p>
              </div>
              <button
                onClick={runPreview}
                disabled={!!busy}
                className="rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"
              >
                Preview
              </button>
            </div>

            <div className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-4">
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">From</span>
                <select
                  value={fromChain}
                  onChange={(e) => setFromChain(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
                >
                  {["BNB", "ETH", "SOL", "BASE"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setFromChain(toChain);
                    setToChain(fromChain);
                  }}
                  className="rounded-full border border-border bg-background p-2 hover:bg-muted"
                  aria-label="Swap chains"
                >
                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                </button>
              </div>

              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">To</span>
                <select
                  value={toChain}
                  onChange={(e) => setToChain(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
                >
                  {["ETH", "BNB", "SOL", "BASE"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Amount (USDC)</span>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
                />
              </label>

              {preview && (
                <div className="rounded-xl border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">
                  <p>
                    Route {preview.fromChain} → {preview.toChain}
                  </p>
                  <p className="mt-1">
                    Amount {fmtUSD(preview.amount)} · Est. fee {fmtUSD(preview.fee)} · ETA {preview.eta}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={executeBridge}
              disabled={!!busy || fromChain === toChain}
              className="btn-primary mt-6 w-full px-4 py-2.5 text-sm disabled:opacity-50"
            >
              <Zap className="h-4 w-4" /> {busy === "execute" ? "Executing..." : "Execute Bridge"}
            </button>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">Transfer status</h3>
          </div>
          <div className="mt-4 space-y-3">
            {displayHistory.map((item: any) => (
              <div key={item.id} className="rounded-xl border border-border bg-background/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{item.label}</p>
                  <span className="text-xs text-muted-foreground">{item.status}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
              </div>
            ))}
            {!displayHistory.length && <p className="text-sm text-muted-foreground">No bridge transfers yet.</p>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
