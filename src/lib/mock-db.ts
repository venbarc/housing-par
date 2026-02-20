import { v4 as uuid } from "uuid";

// ── In-memory store ────────────────────────────────────────
type Doc = Record<string, unknown>;

const store: Record<string, Record<string, Doc>> = {
  wards: {},
  beds: {},
  patients: {},
  documents: {},
  notifications: {},
};

// ── Seed data ──────────────────────────────────────────────
function seed() {
  const now = Date.now();

  // Wards
  store.wards["ward-A"] = { name: "Ward A", floor: "1", description: "General Medicine" };
  store.wards["ward-B"] = { name: "Ward B", floor: "2", description: "Surgical" };
  store.wards["ward-C"] = { name: "Ward C", floor: "3", description: "Pediatrics" };

  // Beds
  const bedDefs = [
    { bedNumber: "A-101", wardId: "ward-A", room: "101", status: "occupied", posX: 40, posY: 40, patientId: "patient-1", updatedAt: now },
    { bedNumber: "A-102", wardId: "ward-A", room: "101", status: "available", posX: 320, posY: 40, patientId: null, updatedAt: now - 1000 },
    { bedNumber: "A-103", wardId: "ward-A", room: "102", status: "cleaning", posX: 40, posY: 200, patientId: null, updatedAt: now - 2000 },
    { bedNumber: "B-201", wardId: "ward-B", room: "201", status: "occupied", posX: 320, posY: 200, patientId: "patient-2", updatedAt: now - 3000 },
    { bedNumber: "B-202", wardId: "ward-B", room: "201", status: "available", posX: 40, posY: 360, patientId: null, updatedAt: now - 4000 },
    { bedNumber: "B-203", wardId: "ward-B", room: "202", status: "maintenance", posX: 320, posY: 360, patientId: null, updatedAt: now - 5000 },
    { bedNumber: "C-301", wardId: "ward-C", room: "301", status: "occupied", posX: 600, posY: 40, patientId: "patient-3", updatedAt: now - 6000 },
    { bedNumber: "C-302", wardId: "ward-C", room: "301", status: "available", posX: 600, posY: 200, patientId: null, updatedAt: now - 7000 },
  ];
  bedDefs.forEach((b, i) => { store.beds[`bed-${i + 1}`] = b; });

  // Patients
  store.patients["patient-1"] = {
    name: "Alice Smith", age: 45, gender: "Female", diagnosis: "Pneumonia",
    status: "recovering", doctor: "Dr. Garcia", admissionDate: "2026-02-15",
    contact: "+1-555-0101", notes: "Responding well to antibiotics",
    bedId: "bed-1", updatedAt: now,
  };
  store.patients["patient-2"] = {
    name: "John Doe", age: 62, gender: "Male", diagnosis: "Cardiac observation",
    status: "stable", doctor: "Dr. Chen", admissionDate: "2026-02-12",
    contact: "+1-555-0102", notes: "Post-surgery monitoring",
    bedId: "bed-4", updatedAt: now - 1000,
  };
  store.patients["patient-3"] = {
    name: "Maria Lopez", age: 8, gender: "Female", diagnosis: "Appendicitis",
    status: "critical", doctor: "Dr. Patel", admissionDate: "2026-02-18",
    contact: "+1-555-0103", notes: "Scheduled for surgery tomorrow",
    bedId: "bed-7", updatedAt: now - 2000,
  };
  store.patients["patient-4"] = {
    name: "Robert Kim", age: 55, gender: "Male", diagnosis: "Fracture - Left Femur",
    status: "stable", doctor: "Dr. Garcia", admissionDate: "2026-02-10",
    contact: "+1-555-0104", notes: "Physical therapy started",
    bedId: null, updatedAt: now - 3000,
  };

  // Notifications
  store.notifications["notif-1"] = {
    type: "critical", message: "Maria Lopez marked as critical - surgery scheduled",
    isRead: false, createdAt: now,
  };
  store.notifications["notif-2"] = {
    type: "admission", message: "New patient admitted: Maria Lopez",
    isRead: false, createdAt: now - 60000,
  };
  store.notifications["notif-3"] = {
    type: "bed_occupied", message: "Patient assigned to bed A-101",
    isRead: true, createdAt: now - 120000,
  };
  store.notifications["notif-4"] = {
    type: "upcoming_discharge", message: "Alice Smith ready for discharge evaluation",
    isRead: false, createdAt: now - 180000,
  };
  store.notifications["notif-5"] = {
    type: "bed_vacated", message: "Bed B-203 moved to maintenance",
    isRead: true, createdAt: now - 240000,
  };
}

seed();

// ── Firestore-compatible mock API ──────────────────────────

export interface MockDocSnap {
  id: string;
  exists: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: () => any;
  ref: MockDocRef;
}

export interface MockDocRef {
  id: string;
  get: () => Promise<MockDocSnap>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (data: any) => Promise<void>;
  delete: () => Promise<void>;
}

export interface MockQuerySnapshot {
  docs: MockDocSnap[];
}

export interface MockQuery {
  where: (field: string, op: string, value: unknown) => MockQuery;
  orderBy: (field: string, direction?: string) => MockQuery;
  limit: (n: number) => MockQuery;
  get: () => Promise<MockQuerySnapshot>;
}

export interface MockCollectionRef extends MockQuery {
  doc: (id: string) => MockDocRef;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  add: (data: any) => Promise<MockDocRef>;
}

export interface MockDb {
  collection: (name: string) => MockCollectionRef;
}

export interface MockStorageFile {
  save: (data?: unknown, opts?: unknown) => Promise<void>;
  getSignedUrl: (opts?: unknown) => Promise<string[]>;
  delete: () => Promise<void>;
}

export interface MockBucket {
  file: (path: string) => MockStorageFile;
}

function makeDocSnap(col: string, id: string): MockDocSnap {
  const docData = store[col]?.[id];
  return {
    id,
    exists: !!docData,
    data: () => docData ? { ...docData } : undefined,
    ref: makeDocRef(col, id),
  };
}

function makeDocRef(col: string, id: string): MockDocRef {
  return {
    id,
    get: async () => makeDocSnap(col, id),
    update: async (data: Doc) => {
      if (!store[col]) store[col] = {};
      if (store[col][id]) {
        store[col][id] = { ...store[col][id], ...data };
      }
    },
    delete: async () => {
      if (store[col]) delete store[col][id];
    },
  };
}

function makeCollection(col: string): MockCollectionRef {
  type Filter = { field: string; op: string; value: unknown };
  type Sort = { field: string; direction: string };
  let filters: Filter[] = [];
  let sorts: Sort[] = [];
  let limitN = Infinity;

  function buildQuery(): MockQuery {
    return {
      where(field: string, op: string, value: unknown) {
        filters = [...filters, { field, op, value }];
        return buildQuery();
      },
      orderBy(field: string, direction = "asc") {
        sorts = [...sorts, { field, direction }];
        return buildQuery();
      },
      limit(n: number) {
        limitN = n;
        return buildQuery();
      },
      get: async () => {
        let docs = Object.entries(store[col] || {}).map(([id, data]) => ({
          id,
          data,
        }));

        // Apply filters
        for (const f of filters) {
          docs = docs.filter((d) => {
            const val = d.data[f.field];
            if (f.op === "==") return val === f.value;
            return true;
          });
        }

        // Apply sorts
        for (const s of sorts) {
          docs.sort((a, b) => {
            const av = a.data[s.field] as number;
            const bv = b.data[s.field] as number;
            return s.direction === "desc" ? bv - av : av - bv;
          });
        }

        // Apply limit
        docs = docs.slice(0, limitN);

        return {
          docs: docs.map((d) => makeDocSnap(col, d.id)),
        };
      },
    };
  }

  const q = buildQuery();

  return {
    ...q,
    doc: (id: string) => makeDocRef(col, id),
    add: async (data: Doc) => {
      const id = uuid();
      if (!store[col]) store[col] = {};
      store[col][id] = { ...data };
      return makeDocRef(col, id);
    },
  };
}

// ── Exported mock ──────────────────────────────────────────
export const mockDb: MockDb = {
  collection: (name: string) => makeCollection(name),
};

export const mockStorage: MockBucket = {
  file: (_path: string) => ({
    save: async () => {},
    getSignedUrl: async () => [`/mock-files/${_path}`],
    delete: async () => {},
  }),
};
