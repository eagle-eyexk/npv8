import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: "user" | "merchant";
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  walletId: string | null;
  merchantId: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: "user" | "merchant";
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, token: null, walletId: null, merchantId: null, loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("nexa_token");
    if (token) {
      fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
            setState({ user: data.user, token, walletId: data.wallet?.id, merchantId: data.merchantId, loading: false });
          } else {
            localStorage.removeItem("nexa_token");
            setState({ user: null, token: null, walletId: null, merchantId: null, loading: false });
          }
        })
        .catch(() => setState({ user: null, token: null, walletId: null, merchantId: null, loading: false }));
    } else {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await fetch(`${API}/api/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Login failed");
    localStorage.setItem("nexa_token", data.token);
    setState({ user: data.user, token: data.token, walletId: data.wallet?.id, merchantId: data.merchantId, loading: false });
  }, []);

  const register = useCallback(async (form: RegisterData) => {
    const r = await fetch(`${API}/api/auth/register`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Registration failed");
    localStorage.setItem("nexa_token", data.token);
    setState({ user: data.user, token: data.token, walletId: data.wallet?.id, merchantId: data.merchant?.id ?? null, loading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("nexa_token");
    setState({ user: null, token: null, walletId: null, merchantId: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
