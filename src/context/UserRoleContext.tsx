import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchUserRole } from "../services/axios"; // Adjust the import path

type UserRole = "super_admin" | "admin";

interface UserRoleContextType {
  role: UserRole | null;
  isLoading: boolean;
  error: Error | null;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(
  undefined
);

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const role = await fetchUserRole();
        setRole(role as UserRole);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch user role")
        );
      } finally {
        setIsLoading(false);
      }
    };

    getUserRole();
  }, []);

  return (
    <UserRoleContext.Provider value={{ role, isLoading, error }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
}
