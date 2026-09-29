import { useState } from "react";
import { useApiData } from "@/lib/useApiData";
import { Wallet, ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { fmtUSD, fmtNum, relTime } from "@/lib/format";
import { GlassCard, PageHeader, ChainBadge, StatusBadge } from "@/components/layout/Primitives";

export default function TreasuryPage() {
  const balances = useApiData<any>("/api/treasury/balances");
  const txs = useApiData<any[]>("/api/treasury/transactions", (payload) => payload.items ?? []);
  const [busy, setBusy] = useState<"deposit" | "withdraw" | "rebalance" | null>(null);

  const data = balances.data;

  async function deposit() {
    setBusy("deposit");
    try {
      await api.post("/api/treasury/deposit", { amount: 10000, chain: "BNB", asset: "USDC" });
      toast.success("Deposit recorded");
      balances.reload();
      txs.reload();
    } catch {
      toast.error("Deposit failed");
    } finally {
      setBusy(null);
    }
  }

  async function withdraw() {
    setBusy("withdraw");
    try {
      await api.post("/api/treasury/withdraw", { amount: 2500, chain: "BNB", asset: "USDC" });
      toast.success("Withdrawal queued");
      balances.reload();
      txs.reload();
    } catch {
      toast.error("Withdrawal failed");
    } finally {
      setBusy(null);
    }
  }

  async function rebalance() {
    setBusy("rebalance");
    try {
      await api.post("/api/treasury/rebalance", { fromChain: "BNB", toChain: "ETH", amount: 5000 });
      toast.success("Rebalance planned");
      balances.reload();
      txs.reload();
    } catch {
      toast.error("Rebalance failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Treasury"
        subtitle="Monitor multi-chain balances, reserves, and settlement liquidity."
        actions={
          <div className="flex flex-wrap gap-2">
            <button onClick={deposit} disabled={!!busy} className="btn-primary px-4 py-2 text-sm disabled:opacity-60">
              <ArrowDownLeft className="h-4 w-4" /> Deposit
            </button>
            <button
              onClick={withdraw}
              disabled={!!busy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-60"
            >
              <ArrowUpRight className="h-4 w-4" /> Withdraw
            </button>
            <button
              onClick={rebalance}
              disabled={!!busy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" /> Rebalance
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassCard>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</p>
          <p className="mt-3 font-display text-3xl font-bold">{data ? fmtUSD(data.total) : "—"}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Available</p>
          <p className="mt-3 font-display text-3xl font-bold">{data ? fmtUSD(data.available) : "—"}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reserved</p>
          <p className="mt-3 font-display text-3xl font-bold">{data ? fmtUSD(data.reserved) : "—"}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gas fees</p>
          <p className="mt-3 font-display text-3xl font-bold">{data ? fmtUSD(data.gasFees) : "—"}</p>
        </GlassCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassCard>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">Token balances</h3>
          </div>
          <div className="mt-4 space-y-3">
            {(data?.tokens ?? []).map((token: any) => (
              <div
                key={`${token.symbol}-${token.chain}`}
                className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-3"
              >
                <div>
                  <p className="font-semibold">
                    {token.symbol} <span className="text-muted-foreground">· {token.chain}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{fmtNum(token.balance)} units</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{fmtUSD(token.value)}</p>
                  <ChainBadge chain={token.chain} />
                </div>
              </div>
            ))}
            {!data?.tokens?.length && (
              <p className="text-sm text-muted-foreground">Loading treasury balances…</p>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-base font-semibold">Recent treasury activity</h3>
          <div className="mt-4 space-y-3">
            {(txs.data ?? []).slice(0, 8).map((tx: any) => (
              <div key={tx.id} className="rounded-xl border border-border bg-background/60 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold capitalize">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">{relTime(tx.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{fmtUSD(tx.amount)}</p>
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              </div>
            ))}
            {!txs.data?.length && !txs.isLoading && (
              <p className="text-sm text-muted-foreground">No treasury transactions yet.</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
