//src\api\tickets.ts
const API_URL = "http://127.0.0.1:8000/api/v1";
import { apiFetch } from "./client";

export interface Ticket {
  id: string;
  number: string;
  category: string;
  sub_service: string;
  priority: boolean;
  status: string;
}

// 🎟️ Create ticket
export const createTicket = async (data: {
  service_id: number;
  sub_service: string;
  priority: boolean;
}) => {
  const res = await apiFetch(`/tickets/issue`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return res.json();
};

// 📋 Get queue (IMPORTANT FIX: agent_id is UUID string)

export const getQueue = async (category: string) => {
  const res = await apiFetch(`/tickets/queue/${category}`);

  if (!res.ok) throw new Error("Failed to fetch queue");

  return res.json();
};

// 👉 Call next
export async function callNextTicket(agentId: string) {
  const res = await apiFetch(`/tickets/action`, {
    method: "POST",
    body: JSON.stringify({
      action: "call_next",
      agent_id: agentId,
    }),
  });

  if (!res.ok) throw new Error("Failed to call next ticket");
  return res.json();
}

// ✅ Done
export async function finishTicket(agentId: string) {
  const res = await apiFetch(`/tickets/action`, {
    method: "POST",
    body: JSON.stringify({
      action: "done",
      agent_id: agentId,
    }),
  });

  if (!res.ok) throw new Error("Failed to finish ticket");
  return res.json();
}

// ⏭️ Skip
export async function skipTicket(agentId: string) {
  const res = await apiFetch(`/tickets/action`, {
    method: "POST",
    body: JSON.stringify({
      action: "skip",
      agent_id: agentId,
    }),
  });

  if (!res.ok) throw new Error("Failed to skip ticket");
  return res.json();
}

export const cancelTicket = async (ticketId: string) => {
  const res = await apiFetch(`/tickets/${ticketId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return res.json();
};