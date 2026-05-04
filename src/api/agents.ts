//src\api\agents.ts
const API_URL = "http://127.0.0.1:8000/api/v1";

export async function getAgents() {
  const res = await fetch(`${API_URL}/agents`);
  return res.json();
}