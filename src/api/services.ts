import { apiFetch } from "./client";

export async function getServices() {
  const res = await apiFetch("/services/");
  return res.json();
}

export async function createService(data: any) {
  const res = await apiFetch("/services/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

// api/services.ts
export async function deleteService(id: number) {
  const res = await apiFetch(`/services/${id}`, {
    method: "DELETE",
  });
  return res.json();
}