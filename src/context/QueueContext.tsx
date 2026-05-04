// src\context\QueueContext.tsx
import { createContext, useState } from "react";
import { createTicket, getQueue } from "../api/tickets";
import type { ReactNode } from "react";
// =========================
// 🎟️ TYPES (match backend)
// =========================
interface Ticket {
  id: number;
  number: string;
  category: string;
  sub_service: string;
  priority: boolean;
  status: string;
  created_at?: string;
  wait_minutes?: number;
}

interface QueueContextType {
  tickets: Ticket[];
  loading: boolean;

  // ✅ FIXED: now uses service_id like backend expects
  addTicket: (
  service_id: number,
  sub_service: string,
  priority: boolean
) => Promise<Ticket>;

  loadQueue: (agentId: string) => Promise<void>;
}

// =========================
// 🧠 CONTEXT
// =========================
export const QueueContext = createContext<QueueContextType>({
  tickets: [],
  loading: false,
  addTicket: async () => {
    throw new Error("QueueContext not initialized");
  },
  loadQueue: async () => {},
});

// =========================
// 📦 PROVIDER
// =========================
export const QueueProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  // 🎟️ CREATE TICKET (FIXED)
const addTicket = async (
  service_id: number,
  sub_service: string,
  priority: boolean
): Promise<Ticket> => {
  setLoading(true);

  try {
    const newTicket: Ticket = await createTicket({
      service_id,
      sub_service,
      priority,
    });

    setTickets((prev) => [...prev, newTicket]);
    return newTicket;

  } catch (err) {
    console.error("Error creating ticket:", err);
    throw err;
  } finally {
    setLoading(false);
  }
};

  const loadQueue = async (agentId: string) => {
  setLoading(true);

  try {
    const data = await getQueue(); // ✅ no fake values
    setTickets(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Error loading queue:", err);
    setTickets([]);
  } finally {
    setLoading(false);
  }
};
  return (
    <QueueContext.Provider
      value={{
        tickets,
        loading,
        addTicket,
        loadQueue,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};