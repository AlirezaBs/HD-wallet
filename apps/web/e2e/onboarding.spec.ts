import { test, expect } from "@playwright/test";

test("shows onboarding when no vault exists", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Welcome to HD Wallet")).toBeVisible();
  await expect(page.getByText("Create a new wallet")).toBeVisible();
});

test("navigates to create wallet flow", async ({ page }) => {
  await page.goto("/onboarding");
  await page.getByText("Create a new wallet").click();
  await expect(page.getByText("Create Password")).toBeVisible();
});

test("shows unlock when vault metadata exists", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const req = indexedDB.open("hd-wallet", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("vault")) {
        db.createObjectStore("vault");
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction("vault", "readwrite");
      tx.objectStore("vault").put(
        {
          hasVault: true,
          vaultVersion: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        "metadata",
      );
    };
  });
  await page.reload();
  await expect(page.getByText("Enter your password to unlock")).toBeVisible();
});
