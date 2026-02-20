"use client";

import { useEffect, useState, useCallback } from "react";

const collectionEndpoints: Record<string, string> = {
  beds: "/api/beds",
  patients: "/api/patients",
  documents: "/api/documents",
  notifications: "/api/notifications",
  wards: "/api/wards",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useCollection<T>(path: string, _constraints?: unknown[]) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const endpoint = collectionEndpoints[path];
    if (!endpoint) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // silently ignore fetch errors during dev
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    fetchData();
    // Poll every 3 seconds to simulate real-time updates
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading };
}
