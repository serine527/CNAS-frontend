// src/context/AuthContext.tsx
import { createContext, useState, ReactNode } from "react";

type Role = "agent" | "admin" | "beneficiary";

interface AuthContextType {
  username: string;
  role: Role | null;
  login: (username: string, password: string, role: Role) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  username: "",
  role: null,
  login: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<Role | null>(null);

  const login = (u: string, password: string, r: Role) => {
    // You can validate password here if you want
    setUsername(u);
    setRole(r);
  };

  const logout = () => {
    setUsername("");
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ username, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};