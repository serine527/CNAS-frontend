export type TicketStatus =
  | "waiting"
  | "serving"
  | "paused"
  | "done"
  | "skipped";

export interface Ticket {
  id: number;

  // display
  number: string;

  // service
  service: string;
  subService?: string;

  // time
  arrivalTime: string;
  waitMinutes: number; // ✅ unified name

  // state
  status: TicketStatus;

  // priority
  priority?: boolean;
}