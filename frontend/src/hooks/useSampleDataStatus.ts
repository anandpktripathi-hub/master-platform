import { useEffect, useState } from "react";
import api from "../lib/api";

export interface SampleDataStatus {
  crmSample: boolean;
  supportSample: boolean;
  socialSample: boolean;
  directorySample: boolean;
}

interface UseSampleDataStatusResult {
  status: SampleDataStatus | null;
  loading: boolean;
  error: string | null;
}

export function useSampleDataStatus(): UseSampleDataStatusResult {
  const [status, setStatus] = useState<SampleDataStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/onboarding/sample-status");
        if (!cancelled) {
          setStatus(res as SampleDataStatus);
        }
      } catch (err: unknown) {
        const e = err as { message?: string };
        if (!cancelled) {
          setError(e.message || "Failed to load sample data status");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { status, loading, error };
}
