import { openDB } from "idb";

export type ActivityEntry = {
  id: string;
  chainFamily: "evm" | "solana";
  type: "send" | "sign";
  hash: string;
  from: string;
  to: string;
  amount: string;
  status: "pending" | "confirmed" | "signed" | "failed";
  timestamp: number;
  explorerUrl: string;
};

const ACTIVITY_DB = "hd-wallet-activity";
const ACTIVITY_STORE = "activity";

async function getActivityDB() {
  return openDB(ACTIVITY_DB, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(ACTIVITY_STORE)) {
        const store = db.createObjectStore(ACTIVITY_STORE, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp");
      }
    },
  });
}

export async function saveActivity(entry: ActivityEntry): Promise<void> {
  const db = await getActivityDB();
  await db.put(ACTIVITY_STORE, entry);
}

export async function updateActivityStatus(
  id: string,
  status: ActivityEntry["status"],
): Promise<void> {
  const db = await getActivityDB();
  const entry = await db.get(ACTIVITY_STORE, id);
  if (!entry) {
    throw new Error(`Activity entry not found: ${id}`);
  }
  await db.put(ACTIVITY_STORE, { ...entry, status });
}

export async function loadActivities(): Promise<ActivityEntry[]> {
  const db = await getActivityDB();
  const all = await db.getAllFromIndex(ACTIVITY_STORE, "timestamp");
  return all.reverse();
}

export async function clearActivities(): Promise<void> {
  const db = await getActivityDB();
  await db.clear(ACTIVITY_STORE);
}
