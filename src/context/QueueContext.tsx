// src/context/QueueContext.tsx
import { createContext, useState, ReactNode } from "react";

interface Ticket {
  number: number;
  service: string;
}

interface QueueContextType {
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, "number">) => Ticket;
}

export const QueueContext = createContext<QueueContextType>({
  tickets: [],
  addTicket: () => ({ number: 0, service: "" }),
});

interface QueueProviderProps {
  children: ReactNode;
}

export const QueueProvider = ({ children }: QueueProviderProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const addTicket = (ticket: Omit<Ticket, "number">) => {
    const newTicket = { number: tickets.length + 1, ...ticket };
    setTickets([...tickets, newTicket]);
    return newTicket;
  };

  return (
    <QueueContext.Provider value={{ tickets, addTicket }}>
      {children}
    </QueueContext.Provider>
  );
};