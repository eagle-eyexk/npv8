const isCapacitor =
  typeof window !== "undefined" &&
  (window.location.protocol === "capacitor:" ||
    window.location.protocol === "ionic:" ||
    (window as any).Capacitor?.isNativePlatform?.());

export const API_BASE: string =
  import.meta.env.VITE_API_URL
    ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, "")
    : isCapacitor
    ? "https://api.nexapay.app"
    : (import.meta.env.BASE_URL as string).replace(/\/$/, "");

export const tok = () => localStorage.getItem("nexa_token") ?? "";
export const adminTok = () => localStorage.getItem("nexa_admin_token") ?? "";
