import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

async function initCapacitorPlugins() {
  if (
    typeof window !== "undefined" &&
    (window as any).Capacitor?.isNativePlatform?.()
  ) {
    try {
      const [{ App: CapApp }, { StatusBar, Style }, { SplashScreen }] =
        await Promise.all([
          import("@capacitor/app"),
          import("@capacitor/status-bar"),
          import("@capacitor/splash-screen"),
        ]);

      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: "#2563EB" });

      setTimeout(() => SplashScreen.hide({ fadeOutDuration: 500 }), 300);

      CapApp.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          CapApp.exitApp();
        }
      });
    } catch (_) {
      // Running as web — native plugins not available
    }
  }
}

initCapacitorPlugins();

createRoot(document.getElementById("root")!).render(<App />);
