// src/api/counters.ts
import { apiFetch } from "./client";

export async function getCounters() {
  const res = await apiFetch("/counters/");
  return res.json();
}

export async function createCounter(data: any) {
  const res = await apiFetch("/counters/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCounter(id: number) {
  const res = await apiFetch(`/counters/${id}`, {
    method: "DELETE",
  });
  return res.json();
}