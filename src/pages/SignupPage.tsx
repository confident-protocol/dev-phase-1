import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight, Wallet, Building2, User as UserIcon, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth";

const STEPS = [
  { key: "company", title: "Company", icon: Building2 },
  { key: "admin", title: "Admin", icon: UserIcon },
  { key: "wallet", title: "Wallet", icon: Wallet },
  { key: "plan", title: "Plan", icon: Sparkles },
];

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [walletLinked, setWalletLinked] = useState(false);
  const [plan, setPlan] = useState("Growth");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function finish() {
    const ok = await login("admin@confidentialpay.com", "00000");
    if (ok) {
      toast.success("Workspace ready");
      navigate("/dashboard");
    } else {
      toast.error("Could not complete signup. Try the demo login.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ backgroundImage: "var(--gradient-hero)" }}>
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-center gap-3">
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

        <div className="mb-8 flex items-center justify-between">
          {STEPS.map((item, index) => {
            const active = index === step;
            const done = index < step;
            return (
              <div key={item.key} className="flex flex-1 items-center last:flex-none">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-xl border-2 transition ${
                    done
                      ? "border-primary bg-primary/10 text-primary"
                      : active
                        ? "border-primary bg-gradient-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-5 w-5" /> : <item.icon className="h-5 w-5" />}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`mx-2 h-0.5 flex-1 ${index < step ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-8 shadow-elegant"
        >
          <h2 className="font-display text-2xl font-bold">{STEPS[step].title} setup</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </p>

          <div className="mt-6 space-y-3">
            {step === 0 && (
              <>
                <Field label="Company name" placeholder="Acme Inc" />
                <Field label="Website" placeholder="https://acme.com" />
                <Field label="Team size" placeholder="11–50" />
              </>
            )}
            {step === 1 && (
              <>
                <Field label="Full name" placeholder="Jane Doe" />
                <Field label="Work email" placeholder="jane@acme.com" />
                <Field label="Password" type="password" placeholder="••••••••" />
              </>
            )}
            {step === 2 && (
              <div className="rounded-xl border border-border bg-secondary/50 p-6 text-center">
                <Wallet className="mx-auto h-10 w-10 text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Connect your treasury wallet (MetaMask or WalletConnect).
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setWalletLinked(true);
                    toast.success("Treasury wallet linked (demo)");
                  }}
                  className="btn-primary mt-4 px-5 py-2 text-sm"
                >
                  {walletLinked ? "Wallet connected" : "Connect wallet"}
                </button>
              </div>
            )}
            {step === 3 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { name: "Starter", price: "$500", features: ["Up to 50 employees", "2 chains"] },
                  { name: "Growth", price: "$1,500", features: ["Up to 250 employees", "All chains", "ZK + FHE"] },
                  { name: "Enterprise", price: "Custom", features: ["Unlimited", "White-label", "Dedicated ops"] },
                ].map((item) => {
                  const selected = plan === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setPlan(item.name)}
                      className={`rounded-xl border p-4 text-left transition ${
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <p className={`text-sm ${selected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{item.name}</p>
                      <p className="mt-1 font-display text-2xl font-bold">{item.price}</p>
                      <ul className={`mt-3 space-y-1 text-xs ${selected ? "text-primary-foreground/85" : "text-muted-foreground"}`}>
                        {item.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-1.5">
                            <Check className="h-3 w-3" /> {feature}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => (step === 0 ? navigate("/login") : setStep(step - 1))}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => {
                  if (step === 2 && !walletLinked) {
                    toast.error("Connect a wallet to continue");
                    return;
                  }
                  setStep(step + 1);
                }}
                className="btn-primary px-5 py-2.5 text-sm"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={finish} className="btn-primary px-5 py-2.5 text-sm">
                Finish with {plan}
              </button>
            )}
          </div>
        </motion.div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</label>
      <input
        {...rest}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
