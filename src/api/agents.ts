//src\api\agents.ts
//const API_URL = "http://127.0.0.1:8000/api/v1";

import { apiFetch } from "./client";

export async function getAgents() {
  const res = await apiFetch("/agents/");
  return res.json();
}

export async function createAgent(data: any) {
  const res = await apiFetch("/agents/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteAgent(id: string) {
  const res = await apiFetch(`/agents/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
export async function updateAgent(id: string, data: any) {
  const res = await apiFetch(`/agents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.json();
}