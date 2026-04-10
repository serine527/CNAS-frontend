// src/context/AuthContext.tsx
import { createContext, useState } from "react";
import type { ReactNode } from "react";

export type Role = "agent" | "admin" | "beneficiary";

interface AuthContextType {
  username: string;
  role: Role | null;
  agentId: number | null; // set on login for agents, null for admin/beneficiary
  login: (username: string, password: string, role: Role, agentId?: number) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  username: "",
  role: null,
  agentId: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string>("");
  const [role, setRole]         = useState<Role | null>(null);
  const [agentId, setAgentId]   = useState<number | null>(null);

  const login = (u: string, _password: string, r: Role, id?: number) => {
    setUsername(u);
    setRole(r);
    setAgentId(id ?? null);
  };

  const logout = () => {
    setUsername("");
    setRole(null);
    setAgentId(null);
  };

  return (
    <AuthContext.Provider value={{ username, role, agentId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};