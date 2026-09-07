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

test("repairs orphaned vault metadata and shows onboarding", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("hd-wallet", 1);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("vault")) {
          db.createObjectStore("vault");
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("vault", "readwrite");
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
        transaction.objectStore("vault").put(
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
  });
  await page.reload();
  await expect(page.getByText("Welcome to HD Wallet")).toBeVisible();
});
