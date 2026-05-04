//src\context\AuthContext.tsx
import { createContext, useState, useEffect } from "react";
import { loginUser } from "../api/auth";
import type { ReactNode } from "react";
// agent_id is now a UUID string from the backend
type User = {
  username: string;
  role: "admin" | "agent";
  agentId?: string | null;    // ← changed from number to string (UUID)
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<any>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

type Props = { children: ReactNode };

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);

  // restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string) => {
    const data = await loginUser(username, password);   // throws on error

    localStorage.setItem("token", data.access_token);

    const userData: User = {
      username: data.username,
      role:     data.role,
      agentId:  data.agent_id,   // UUID string or null
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}