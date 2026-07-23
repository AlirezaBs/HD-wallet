import { AccountSelector } from "@/components/AccountSelector";
import { NetworkToggle } from "@/components/NetworkToggle";
import { WalletPortfolioProvider } from "@/features/tokens/WalletPortfolioProvider";
import { lockWallet } from "@/lib/wallet-session";
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme/ThemeProvider";
import { useSettingsStore } from "@hd-wallet/stores";
import { Activity, Home, Lock, Moon, Send, Settings, Sun } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/wallet", icon: Home, label: "Home", end: true },
  { to: "/wallet/send", icon: Send, label: "Send" },
  { to: "/wallet/activity", icon: Activity, label: "Activity" },
  { to: "/wallet/settings", icon: Settings, label: "Settings" },
];

export function WalletShell() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const { resolved } = useTheme();
  const navigate = useNavigate();

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(resolved === "dark" ? "light" : "dark");
      return;
    }
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLock = () => {
    void lockWallet({ navigate });
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col border-x border-border shadow-lg">
        <header className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between gap-2">
            <AccountSelector />
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={handleLock}
                className="p-2 rounded-lg hover:bg-accent"
                aria-label="Lock wallet"
              >
                <Lock className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-accent"
                aria-label="Toggle theme"
              >
                {resolved === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <NetworkToggle />
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <WalletPortfolioProvider>
            <Outlet />
          </WalletPortfolioProvider>
        </main>

        <nav className="border-t border-border flex">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
