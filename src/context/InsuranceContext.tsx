import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { fetchInsurance } from '../services/axios';

// Define types
type InsurancePlan = {
  id: string;
  plan_name: string;
  provider: string;
  plan_type: string;
  coverage_type: string;
  benefit_effective_start_dt: string;
  active_organizations: number;
  notes: string;
};

interface DashboardContextType {
  insurancePlans: InsurancePlan[];
  isLoading: boolean;
  error: string | null;
  loadInsurancePlans: () => Promise<void>;
  addInsurancePlan: (newPlan: InsurancePlan) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load insurance plans from API
  const loadInsurancePlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchInsurance();
      setInsurancePlans(data);
    } catch (err) {
      setError('Failed to load insurance plans');
      console.error('Error loading insurance plans:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new insurance plan to the state
  const addInsurancePlan = useCallback((newPlan: InsurancePlan) => {
    setInsurancePlans(prevPlans => [newPlan, ...prevPlans]);
  }, []);

  // Initialize data on context mount
  React.useEffect(() => {
    loadInsurancePlans();
  }, [loadInsurancePlans]);

  return (
    <DashboardContext.Provider
      value={{
        insurancePlans,
        isLoading,
        error,
        loadInsurancePlans,
        addInsurancePlan
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook for using the Dashboard context
export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};