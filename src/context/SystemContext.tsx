// src/context/SystemContext.tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type SystemMode = "single" | "multi";
export type ServiceCategory = "prestation" | "medical";

export interface Agent {
  id: number;
  name: string;
  // Only meaningful in multi mode — null means not yet assigned
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

// ─── Default agents ───────────────────────────────────────────────────────────
const defaultAgents: Agent[] = [
  { id: 1, name: "أحمد محمد",  category: null, assignedService: null },
  { id: 2, name: "سارة علي",   category: null, assignedService: null },
  { id: 3, name: "خالد حسن",   category: null, assignedService: null },
  { id: 4, name: "نور الدين",  category: null, assignedService: null },
  { id: 5, name: "فاطمة زهرة", category: null, assignedService: null },
];

const defaultConfig: SystemConfig = {
  mode: "single",
  agents: defaultAgents,
};

// ─── Context ──────────────────────────────────────────────────────────────────
interface SystemContextValue {
  config: SystemConfig;
  setConfig: (c: SystemConfig) => void;
  isMulti: boolean;
  getAgent: (agentId: number) => Agent | undefined;
  updateAgent: (agentId: number, patch: Partial<Agent>) => void;
  addAgent: (name: string) => Agent;
  removeAgent: (agentId: number) => void;
}

const SystemContext = createContext<SystemContextValue>({
  config: defaultConfig,
  setConfig: () => {},
  isMulti: false,
  getAgent: () => undefined,
  updateAgent: () => {},
  addAgent: () => ({ id: 0, name: "", category: null, assignedService: null }),
  removeAgent: () => {},
});

export function SystemProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);

  const getAgent = (agentId: number) =>
    config.agents.find((a) => a.id === agentId);

  const updateAgent = (agentId: number, patch: Partial<Agent>) => {
    setConfig((prev) => ({
      ...prev,
      agents: prev.agents.map((a) => (a.id === agentId ? { ...a, ...patch } : a)),
    }));
  };

  const addAgent = (name: string): Agent => {
    const newId = Math.max(0, ...config.agents.map((a) => a.id)) + 1;
    const newAgent: Agent = { id: newId, name, category: null, assignedService: null };
    setConfig((prev) => ({ ...prev, agents: [...prev.agents, newAgent] }));
    return newAgent;
  };

  const removeAgent = (agentId: number) => {
    setConfig((prev) => ({
      ...prev,
      agents: prev.agents.filter((a) => a.id !== agentId),
    }));
  };

  return (
    <SystemContext.Provider
      value={{ config, setConfig, isMulti: config.mode === "multi", getAgent, updateAgent, addAgent, removeAgent }}
    >
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  return useContext(SystemContext);
}