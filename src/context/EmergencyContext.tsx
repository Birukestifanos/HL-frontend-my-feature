import { createContext, useContext, useState, useCallback } from "react";
import emergencyAPI, {
  type Emergency,
  type EmergencyPayload,
} from "../services/api/emergencyApi";

interface EmergencyContextType {
  emergencies: Emergency[];
  activeEmergencies: Emergency[];
  loading: boolean;
  error: string | null;
  // Public
  fetchAll: () => Promise<void>;
  fetchActive: () => Promise<void>;
  fetchById: (id: number) => Promise<Emergency>;
  // Admin
  createEmergency: (data: EmergencyPayload) => Promise<void>;
  updateEmergency: (
    id: number,
    data: Partial<EmergencyPayload>,
  ) => Promise<void>;
  deleteEmergency: (id: number) => Promise<void>;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(
  undefined,
);

export function EmergencyProvider({ children }: { children: React.ReactNode }) {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [activeEmergencies, setActiveEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await emergencyAPI.getAll();
      setEmergencies(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to fetch emergencies");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActive = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await emergencyAPI.getActive();
      setActiveEmergencies(res.data);
    } catch (e: any) {
      setError(
        e.response?.data?.message || "Failed to fetch active emergencies",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id: number) => {
    const res = await emergencyAPI.getById(id);
    return res.data;
  }, []);

  const createEmergency = useCallback(
    async (data: EmergencyPayload) => {
      await emergencyAPI.create(data);
      await fetchAll();
    },
    [fetchAll],
  );

  const updateEmergency = useCallback(
    async (id: number, data: Partial<EmergencyPayload>) => {
      await emergencyAPI.update(id, data);
      await fetchAll();
    },
    [fetchAll],
  );

  const deleteEmergency = useCallback(
    async (id: number) => {
      await emergencyAPI.delete(id);
      await fetchAll();
    },
    [fetchAll],
  );

  return (
    <EmergencyContext.Provider
      value={{
        emergencies,
        activeEmergencies,
        loading,
        error,
        fetchAll,
        fetchActive,
        fetchById,
        createEmergency,
        updateEmergency,
        deleteEmergency,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const ctx = useContext(EmergencyContext);
  if (!ctx)
    throw new Error("useEmergency must be used within EmergencyProvider");
  return ctx;
}
