import { apiFetch } from "./client";

export async function getSystem() {
  const res = await apiFetch("/system/");
  return res.json();
}

export async function updateSystemMode(mode: "single" | "multi") {
  const res = await apiFetch(`/system/mode?mode=${mode}`, {
    method: "PATCH",
  });
  return res.json();
}