import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export async function copyWithClear(
  text: string,
  clearMs = 30000,
): Promise<void> {
  await navigator.clipboard.writeText(text);
  setTimeout(async () => {
    try {
      const current = await navigator.clipboard.readText();
      if (current === text) {
        await navigator.clipboard.writeText("");
      }
    } catch {
      // Clipboard read may fail without permission
    }
  }, clearMs);
}
