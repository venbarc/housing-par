// Mock implementation – replaces Firebase Admin SDK with in-memory store.
// Switch back to real Firebase by restoring the original file and setting env vars.

import { mockDb, mockStorage, type MockDb, type MockBucket } from "../mock-db";

export const adminDb: MockDb = mockDb;
export const adminStorage: MockBucket = mockStorage;
