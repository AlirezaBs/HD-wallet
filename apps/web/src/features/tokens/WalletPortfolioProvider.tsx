import { createContext, useContext, type ReactNode } from "react";
import { useWalletPortfolio } from "@/hooks/useWalletPortfolio";

type WalletPortfolioContextValue = ReturnType<typeof useWalletPortfolio>;

const WalletPortfolioContext =
  createContext<WalletPortfolioContextValue | null>(null);

export function WalletPortfolioProvider({ children }: { children: ReactNode }) {
  const portfolio = useWalletPortfolio();
  return (
    <WalletPortfolioContext.Provider value={portfolio}>
      {children}
    </WalletPortfolioContext.Provider>
  );
}

export function useWalletPortfolioContext(): WalletPortfolioContextValue {
  const context = useContext(WalletPortfolioContext);
  if (!context) {
    throw new Error(
      "useWalletPortfolioContext must be used within WalletPortfolioProvider",
    );
  }
  return context;
}
