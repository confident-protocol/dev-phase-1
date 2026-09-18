import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "./api";

export interface CPUser {
  email: string;
  name: string;
  role: "admin";
  company: string;
}

interface AuthCtx {
  user: CPUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CPUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    const raw = window.localStorage.getItem("cp_user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        /* noop */
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      window.localStorage.setItem("cp_token", data.token);
      window.localStorage.setItem("cp_user", JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem("cp_token");
    window.localStorage.removeItem("cp_user");
    setUser(null);
    window.location.href = "/login";
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({ user, isAuthenticated: !!user, loading, login, logout }),
    [user, loading, login, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
