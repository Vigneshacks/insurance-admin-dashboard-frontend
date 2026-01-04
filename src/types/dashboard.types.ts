export interface Company {
  id: string | number;
  organization: string;
  users: number;
  address: string;
  billingcontact: string;
  billingemail: string;
  startdate: string;
  renewaldate: string;
}

export interface User {
  id: string | number;
  name: string;
  organization: string;
  email: string;
  phonenumber: string;
  role: string;
  startdate: Date;
  assignedInsurancePlans: string;
}

export interface MemberGroup {
  id: string;
  org_name: string;
  org_address: string;
  billing_contact_name: string;
  billing_contact_email: string;
}

interface BenefitPlan {
  name?: string;
  type?: string;
  // Add other benefit plan properties as needed
}
export interface UserApiResponse {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  work_email: string | null;
  phone: string;
  role: string;
  status: string;
  created_at: string;
  member_group: MemberGroup;
  is_admin: boolean;
  start_date: string | null;
  benefit_plan: BenefitPlan[];
}


export interface InsuranceFormData {
  planName: string;
  planType: string;
  provider: string;
  startDate: string;
  notes: string;
  selectedOrganizations: Array<{
    id: string | number;
    text: string;
    effectiveStartDate?: string;
    effectiveEndDate?: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    file: File;
    uploadedDate: string;
  }>;
}


export interface InsurancePlan {
  id: string;
  plan_name: string;
  plan_grp: string;
  coverage_type: string;
  provider: string;
  benefit_effective_start_dt: string;
  active_organizations: number;
  notes: string;
  plan_type: string;
  file_url: string;
  file_name: string;
  organizations: {
    org_name: string;
    billing_contact_name: string;
    org_address: string;
    id: string;
  }[];
  // Optional convenience fields
  organizationNames?: string[];
  displayFileName?: string;
}


export interface EmployeeRequest {
  id: string;
  employee_name: string;
  request_type: string;
  status: string;
  date_submitted: Date;
  details: string;
  
  // Add any other fields from your API response
}



export interface DashboardContextType {
  companies: Company[];
  users: User[];
  loading: boolean;
  usersLoading: boolean;
  loadCompanies: (forceRefresh?: boolean) => Promise<void>;
  loadUsers: (forceRefresh?: boolean) => Promise<void>;
  initializeData: () => Promise<void>;
  refreshData: () => Promise<void>;
  refreshCompanies: () => Promise<Company[]>;
  updateCompany:(companyId: string | number, formData: Company) => Promise<any>;
  addCompany: (organization: Company) => void;
  updateUser: (userId: string, userData: any) => Promise<any>;
  addUser: (user: User) => void;
  deleteCompany: (companyId: string | number) => void;
  deleteUserFromContext: (userId: string | number) => void;
  updateCompanySort: (key: string, ascending: boolean) => void;
  updateUserSort: (key: string, ascending: boolean) => void;
  companySortState: { key: string; ascending: boolean };
  userSortState: { key: string; ascending: boolean };
  createInsurancePlan: (formData: InsuranceFormData) => Promise<any>;
  refreshInsurancePlans: () => Promise<void>;
  loadInsurancePlans: () => Promise<void>;
  updateInsurancePlan: (insuranceId: string, formData: InsuranceFormData) => Promise<any>;
  deleteInsurancePlan: (insuranceId: string) => Promise<void>;
  insuranceplans: InsurancePlan[];
  insuranceFetchLoading : boolean;
  employeeRequests: EmployeeRequest[];
  pendingRequests: EmployeeRequest[];
  employeeRequestsLoading: boolean;
  loadEmployeeRequests: (searchTerm?: string, forceRefresh?: boolean) => Promise<EmployeeRequest[]>;
  loadPendingRequests: (searchTerm?: string, forceRefresh?: boolean) => Promise<EmployeeRequest[]>;
  updateEmployeeRequestStatus: (requestId: string, status: string) => Promise<any>;
}
