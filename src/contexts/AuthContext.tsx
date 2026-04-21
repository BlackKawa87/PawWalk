import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "owner" | "walker" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  loginAs: (user: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "pawgo_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string, role: UserRole = "owner") => {
    // Mock auth — replace with Supabase signInWithPassword
    const mockUser: AuthUser = {
      id: crypto.randomUUID(),
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role,
      location: "London, UK",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const loginAs = (userData: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAs, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
