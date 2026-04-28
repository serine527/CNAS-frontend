//src\context\AuthContext.tsx
import { createContext, useState, ReactNode } from "react";
import { createTicket, getQueue } from "../api/tickets";

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
}

interface QueueContextType {
  tickets: Ticket[];
  loading: boolean;
  addTicket: (ticket: {
    category: string;
    sub_service: string;
    priority: boolean;
  }) => Promise<Ticket>;
  loadQueue: (agentId: number) => Promise<void>;
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

  // 🎟️ CREATE TICKET
  const addTicket = async (ticket: {
    category: string;
    sub_service: string;
    priority: boolean;
  }): Promise<Ticket> => {
    setLoading(true);

    try {
      const newTicket = await createTicket(ticket);

      setTickets((prev) => [...prev, newTicket]);

      return newTicket;
    } catch (err) {
      console.error("Error creating ticket:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 📋 LOAD QUEUE
  const loadQueue = async (agentId: number) => {
    setLoading(true);

    try {
      const data = await getQueue(agentId);
      setTickets(data);
    } catch (err) {
      console.error("Error loading queue:", err);
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