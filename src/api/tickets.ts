//src\api\tickets.ts
const API_URL = "http://127.0.0.1:8000";

export interface Ticket {
  id: number;
  number: string;
  category: string;
  sub_service: string;
  priority: boolean;
  status: string;
}

// 🎟️ Create ticket (beneficiary side)
export async function createTicket(data: {
  category: string;
  sub_service: string;
  priority: boolean;
}) {
  const res = await fetch(`${API_URL}/tickets/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create ticket");
  }

  return res.json();
}

// 📋 Get queue (agent screen)
export async function getQueue(agentId: number) {
  const res = await fetch(`${API_URL}/tickets/queue/${agentId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch queue");
  }

  return res.json();
}

// 👉 Call next ticket (agent button)
export async function callNextTicket(agentId: number) {
  const res = await fetch(`${API_URL}/tickets/next/${agentId}`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to get next ticket");
  }

  return res.json();
}

// ✅ Mark done
export async function finishTicket(ticketId: number) {
  const res = await fetch(`${API_URL}/tickets/${ticketId}/done`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to finish ticket");
  }

  return res.json();
}