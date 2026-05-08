import { apiFetch } from "./client";

export async function getStats() {
  const res = await apiFetch("/stats/");
  return res.json();
}