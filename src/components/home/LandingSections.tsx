import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X, Check } from "lucide-react";
import type { Variants } from "framer-motion";
import HeroIllustration from "@/components/home/HeroIllustration";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? "visible" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}

function CountUp({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      setN(Math.floor((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

function BrandMark({ large = false }: { large?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground ${
          large ? "h-12 w-12" : "h-9 w-9"
        }`}
      >
        <svg viewBox="0 0 24 24" className={large ? "h-6 w-6" : "h-4 w-4"} fill="none" aria-hidden>
          <path
            d="M12 3 4 7v5c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V7l-8-4Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <span className={`font-display font-bold tracking-tight ${large ? "text-3xl sm:text-4xl" : "text-lg"}`}>
        Confidential<span className="text-gradient">Pay</span>
      </span>
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#product", label: "Product" },
    { href: "#how", label: "How it works" },
    { href: "#pricing", label: "Pricing" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled ? "border-b border-border/80 bg-background/85 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
        <Link to="/" aria-label="ConfidentialPay home">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-secondary">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary px-5 py-2.5 text-sm shadow-elegant">
            Open workspace <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
          <div className="space-y-3 px-6 py-5">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="block text-sm text-muted-foreground">
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 rounded-xl border border-border px-4 py-2.5 text-center text-sm font-semibold">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary flex-1 px-4 py-2.5 text-sm">
                Open workspace
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <HeroIllustration />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-6 pb-16 pt-28 md:justify-center md:pb-24 md:pt-32">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-xl">
          <motion.div variants={fadeUp}>
            <BrandMark large />
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="mt-8 font-display text-4xl font-extrabold leading-[0.98] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Private payroll that settles across every chain.
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Keep salaries encrypted, prove compliance selectively, and move USDC from treasury to teammates without leaking the ledger.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/signup" className="btn-primary px-6 py-3 text-sm shadow-elegant">
              Start free workspace <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:bg-card"
            >
              View live demo
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function ProductSection() {
  return (
    <section id="product" className="px-6 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-2xl">
          <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Product
          </motion.p>
          <motion.h2 variants={fadeUp} className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            One orchestrator for confidential payroll.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            ConfidentialPay coordinates deposits, ZK proofs, CCTP bridging, and shielded payouts so finance teams never publish salary graphs on-chain.
          </motion.p>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-3">
          {[
            {
              title: "Encrypted roster",
              body: "Employee salaries stay as FHE ciphertext. Operators run payroll without revealing amounts in events.",
            },
            {
              title: "Seven-stage settlement",
              body: "Deposit, prove, swap, bridge, shield, transfer, withdraw — tracked live with request-level audit trails.",
            },
            {
              title: "Selective disclosure",
              body: "Issue time-boxed viewing keys for auditors. Approval and denial remain indistinguishable on-chain.",
            },
          ].map((item, i) => (
            <Reveal key={item.title}>
              <motion.div variants={fadeUp} className="border-t border-border pt-6">
                <p className="font-mono text-xs text-muted-foreground">0{i + 1}</p>
                <h3 className="mt-3 font-display text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricsSection() {
  return (
    <section className="px-6 pb-8 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 border-y border-border py-10 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Payroll processed", value: 1234567, prefix: "$", suffix: "+" },
          { label: "Active employees", value: 147, suffix: "+" },
          { label: "Cross-chain tx", value: 342, suffix: "+" },
          { label: "Privacy score", value: 96, suffix: "%" },
        ].map((item) => (
          <div key={item.label}>
            <p className="font-display text-3xl font-bold tracking-tight">
              <CountUp value={item.value} prefix={item.prefix} suffix={item.suffix} />
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowSection() {
  return (
    <section id="how" className="px-6 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-2xl">
          <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            How it works
          </motion.p>
          <motion.h2 variants={fadeUp} className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            From treasury to teammate in one private run.
          </motion.h2>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { step: "01", title: "Connect wallets", body: "Register treasury and employee wallets across ETH, Base, Solana, and BNB." },
            { step: "02", title: "Encrypt & prove", body: "Generate Ligero proofs and bind salaries into an encrypted roster root." },
            { step: "03", title: "Settle privately", body: "Bridge with CCTP, enter the shielded pool, and release destination USDC." },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
              <p className="font-display text-sm font-bold text-primary">{item.step}</p>
              <h3 className="mt-4 font-display text-xl font-bold">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-2xl">
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold sm:text-4xl">
            Pricing built for operating teams.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            Transaction fees stay between 0.3–0.7%. SaaS tiers cover orchestration, compliance, and support.
          </motion.p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {[
            { name: "Starter", price: "$500", period: "/mo", features: ["Up to 50 employees", "2 chains", "ZK proofs", "Email support"] },
            {
              name: "Growth",
              price: "$1,500",
              period: "/mo",
              featured: true,
              features: ["Up to 250 employees", "ETH · Base · SOL · BNB", "FHE roster + CCTP", "Priority support"],
            },
            { name: "Enterprise", price: "Custom", period: "", features: ["Unlimited seats", "White-label", "Viewing-key compliance", "Dedicated ops"] },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 ${
                plan.featured ? "border-primary bg-primary text-primary-foreground shadow-elegant" : "border-border bg-card"
              }`}
            >
              <p className={`text-sm font-semibold ${plan.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {plan.name}
              </p>
              <p className="mt-3 font-display text-4xl font-bold">
                {plan.price}
                <span className={`text-base font-medium ${plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {plan.period}
                </span>
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className={plan.featured ? "text-primary-foreground/90" : "text-muted-foreground"}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  plan.featured
                    ? "bg-accent text-accent-foreground hover:brightness-105"
                    : "bg-gradient-primary text-primary-foreground"
                }`}
              >
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <BrandMark />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            The private payroll layer for the multi-chain economy.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ConfidentialPay Inc.</p>
      </div>
    </footer>
  );
}

export default function LandingSections() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <HeroSection />
        <MetricsSection />
        <ProductSection />
        <HowSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
