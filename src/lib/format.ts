export const fmtUSD = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2, ...opts }).format(n);

export const fmtNum = (n: number) => new Intl.NumberFormat("en-US").format(n);

export const truncAddr = (a: string, n = 4) => (a.length > n * 2 + 2 ? `${a.slice(0, n + 2)}…${a.slice(-n)}` : a);

export const chainColor: Record<string, string> = {
  BNB: "var(--chain-bnb)",
  ETH: "var(--chain-eth)",
  SOL: "var(--chain-sol)",
  BASE: "var(--chain-base)",
};

export const relTime = (iso: string) => {
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
