//src\context\AuthContext.tsx
import { createContext, useState, ReactNode } from "react";
import { loginUser } from "../api/auth";
import { useEffect } from "react";

// ✅ Define User type
type User = {
  username: string;
  role: "admin" | "agent";
  agentId?: number | null;
};

// ✅ Define Context type
type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<any>;
  logout: () => void;
};

// ✅ Create context with proper typing
export const AuthContext = createContext<AuthContextType | null>(null);

// ✅ Props type
type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  useEffect(() => {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
 }, []);
  const [user, setUser] = useState<User | null>(null);

 const login = async (username: string, password: string) => {
  try {
    const data = await loginUser(username, password);

    localStorage.setItem("token", data.access_token);

    const userData: User = {
      username: data.username,
      role: data.role,
      agentId: data.agent_id,
    };


    
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return data;

  } catch (err: any) {
    throw new Error(err.message || "Login failed");
  }
};

 const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // 🔥 ADD THIS
  setUser(null);
};

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}