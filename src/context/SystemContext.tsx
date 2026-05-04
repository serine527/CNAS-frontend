// src/context/SystemContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getAgents } from "../api/agents";

// ─── Types ────────────────────────────────────────────────────────────────────
export type SystemMode = "single" | "multi";
export type ServiceCategory = "prestation" | "medical";

export interface Agent {
  id: string;
  name: string;
  category: ServiceCategory | null;
  assignedService: string | null;
}

export interface SystemConfig {
  mode: SystemMode;
  agents: Agent[];
}

// ─── Service Data ─────────────────────────────────────────────────────────────
export const prestationServices: string[] = [
  "تحديث بطاقة الشفاء",
  "طلب بطاقة الشفاء أو نسخة منها",
  "طلب استرجاع: توقف عن العمل، إجازة الأمومة، منتجات صيدلانية، رأس المال عند الوفاة، خدمات طبية",
  "طلب تمديد إجازة الأمومة",
  "تحديث ملف المؤمن عليه الاجتماعي",
  "فتح حقوق المؤمن عليه الاجتماعي وأفراد عائلته",
  "طلب شهادة انتساب أو عدم انتساب",
  "طلب تغطية لتجهيزات طبية أو علاج حراري",
  "إبلاغ عن حادث عمل",
];

export const medicalServices: string[] = [
  "فحص طبي بعد توقف عن العمل",
  "تمديد إجازة الأمومة",
  "فحص قبلي",
  "استرجاع تكاليف العلاج الطبي",
  "طلبات أخرى مرتبطة بالمتابعة الطبية",
];

export const allServices = [...prestationServices, ...medicalServices];

export function getCategoryForService(service: string): ServiceCategory {
  return prestationServices.includes(service) ? "prestation" : "medical";
}

// ─── Default config ───────────────────────────────────────────────────────────
const defaultConfig: SystemConfig = {
  mode: "single",
  agents: [],
};

// ─── Context ──────────────────────────────────────────────────────────────────
interface SystemContextValue {
  config: SystemConfig;
  setConfig: (c: SystemConfig) => void;
  isMulti: boolean;
  getAgent: (agentId: string) => Agent | undefined;
  updateAgent: (agentId: string, patch: Partial<Agent>) => void;
  addAgent: (name: string) => Agent;
  removeAgent: (agentId: string) => void;
}

const SystemContext = createContext<SystemContextValue>({
  config: defaultConfig,
  setConfig: () => {},
  isMulti: false,
  getAgent: () => undefined,
  updateAgent: () => {},
  addAgent: () => ({
    id: "",
    name: "",
    category: null,
    assignedService: null,
  }),
  removeAgent: () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────
export function SystemProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);

  // ── Load agents from backend (seeded DB) ───────────────────────────────────
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const data = await getAgents();

        setConfig((prev) => ({
          ...prev,
          agents: data.map((a: any) => ({
            id: a.id,
            name: a.name,
            category: a.category ?? null,
            assignedService: a.assigned_service ?? null,
          })),
        }));
      } catch (err) {
        console.error("Failed to load agents:", err);
      }
    };

    loadAgents();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getAgent = (agentId: string) =>
    config.agents.find((a) => a.id === agentId);

  const updateAgent = (agentId: string, patch: Partial<Agent>) => {
    setConfig((prev) => ({
      ...prev,
      agents: prev.agents.map((a) =>
        a.id === agentId ? { ...a, ...patch } : a
      ),
    }));
  };

  const addAgent = (name: string): Agent => {
    const newAgent: Agent = {
      id: crypto.randomUUID(),
      name,
      category: null,
      assignedService: null,
    };

    setConfig((prev) => ({
      ...prev,
      agents: [...prev.agents, newAgent],
    }));

    return newAgent;
  };

  const removeAgent = (agentId: string) => {
    setConfig((prev) => ({
      ...prev,
      agents: prev.agents.filter((a) => a.id !== agentId),
    }));
  };

  return (
    <SystemContext.Provider
      value={{
        config,
        setConfig,
        isMulti: config.mode === "multi",
        getAgent,
        updateAgent,
        addAgent,
        removeAgent,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useSystem() {
  return useContext(SystemContext);
}