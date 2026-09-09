import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path d="M12 3 4 7v5c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V7l-8-4Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <span className="font-display text-lg font-bold tracking-tight">
        Confidential<span className="text-gradient">Pay</span>
      </span>
    </div>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-12">
      <div className="relative hidden overflow-hidden lg:col-span-7 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-10">
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "var(--gradient-hero)" }} />
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-30" aria-hidden>
          <defs>
            <pattern id="auth-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="oklch(0.45 0.04 200 / 0.2)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>

        <div className="relative">
          <Link to="/">
            <BrandMark />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative max-w-xl"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Workspace access</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
            Run confidential payroll without publishing the graph.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Sign in to orchestrate encrypted rosters, CCTP bridges, and shielded employee payouts from one desk.
          </p>

          <div className="mt-10 space-y-3 border-l-2 border-primary/30 pl-4 text-sm text-muted-foreground">
            <p>ZK proofs generated under 2s in the demo orchestrator</p>
            <p>FHE salary handles never land in plaintext events</p>
            <p>Multi-chain USDC settlement via CCTP + Hyperlane</p>
          </div>
        </motion.div>

        <p className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} ConfidentialPay Inc.
        </p>
      </div>

      <div className="relative flex items-center justify-center bg-card px-6 py-12 lg:col-span-5 lg:border-l lg:border-border">
        <div className="absolute left-6 top-6 lg:hidden">
          <Link to="/">
            <BrandMark />
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
