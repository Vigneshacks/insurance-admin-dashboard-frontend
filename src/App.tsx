import "./styles/globals.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/layouts/Sidebar.tsx";
import { useState, useEffect } from "react";
import Dashboard from "./components/dashboard/dashboard/Dashboard.tsx";
import Companies from "./components/dashboard/Organization/Companies.tsx";
import Users from "./components/dashboard/users/Users.tsx";
import { ActivePageType } from "./types/ActivePageType.ts";
import Requests from "./components/dashboard/requests/Requests.tsx";
import { DashboardProvider } from "./context/DashboardContext.tsx";
import InsurancePlans from "./components/dashboard/insurancePlans/InsurancePlans.tsx";
import ManageSubscription from "./components/dashboard/manage subscription/ManageSubscription.tsx";
import { UserRoleProvider } from "./context/UserRoleContext.tsx";
import CompanyDetailsPage from "./components/dashboard/companies/OrganizationDetailView.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import InsuranceSystems from "./components/dashboard/insurancePlans/SearchInsurancePlans.tsx";
import { setTokenGetter } from "./services/tokenProvider";
import { ToastContainer, Zoom } from "react-toastify";
import { AppLoader } from "./commonComponents/AppLoader.tsx";


// import { testConnection } from "./services/axios.ts";

// Auth Dialog Component
const AuthDialog = ({ onLogin }: { onLogin: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="fixed inset-0 bg-black/50" />
    <div className="relative w-full max-w-md m-4 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between px-6 py-6 rounded-t-lg" style={{ background: 'linear-gradient(180deg, #1E4477 0%, #122947 100%)' }}>
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#FFFFFF" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h2 className="text-xl font-medium tracking-normal text-white">Authentication Required</h2>
        </div>
      </div>

      <div className="px-6 py-7">
        <p className="mb-6 text-sm text-slate-700">
          To access this application, please log in with your credentials.
        </p>
        <div className="flex flex-col gap-3">
          <button
            className="h-12 px-6 text-base font-medium text-white bg-[#1E4477] rounded-md hover:bg-[#122947] transition"
            onClick={onLogin}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  </div>
);


function App() {
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [activePage, setActivePage] = useState<ActivePageType>("dashboard");

  // Set up the token getter for axios interceptor
  useEffect(() => {
    if (isAuthenticated) {
      setTokenGetter(() => getAccessTokenSilently());
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) {
    return <AppLoader />;
  }

  if (!isAuthenticated) {
    return <AuthDialog onLogin={loginWithRedirect} />;
  }

  return (
    <UserRoleProvider>
      <DashboardProvider>
        <div className="flex h-screen bg-blue-50">
          <Sidebar setActivePage={setActivePage} activePage={activePage} />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:companyId" element={<CompanyDetailsPage />} />
              <Route path="/users" element={<Users />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/insurance-plans" element={<InsurancePlans />} />
              <Route path="/insurance-systems" element={<InsuranceSystems />} />
              <Route path="/manage-subscription" element={<ManageSubscription />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
            <ToastContainer
              position="bottom-center"
              autoClose={3000}
              hideProgressBar
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light" // Using the built-in colored theme
              // toastStyle={{ backgroundColor: "#1E4477" }} // Set your preferred blue color
              transition={Zoom}
            />
          </main>
        </div>

      </DashboardProvider>
    </UserRoleProvider>
  );
}

export default App;
