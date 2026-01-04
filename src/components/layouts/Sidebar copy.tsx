import { useState } from "react";
import { ActivePageType } from "../../types/ActivePageType";
import SidebarHeader from "./components/SidebarHeader";
import SidebarTopButtons from "./components/SidebarTopButtons";

// Define props type
type Props = {
  activePage: ActivePageType;
  setActivePage: (activePage: ActivePageType) => void;
};

const Sidebar = (props: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const toggleDashboard = () => {
    setIsDashboardOpen((prevState) => !prevState);
  };

  return (
    <div
      className={`transition-width flex h-screen flex-col items-center justify-between border-r border-r-blue-100 p-3 duration-300 ${
        isCollapsed ? "w-[60px]" : "w-[200px]"
      }`}
    >
      <div className="mt-2 flex flex-col gap-4">
        <SidebarHeader
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
        />
        <SidebarTopButtons
          isDashboardOpen={isDashboardOpen}
          toggleDashboard={toggleDashboard}
          isCollapsed={isCollapsed}
          setActivePage={props.setActivePage}
        />
      </div>
    </div>
  );
};

export default Sidebar;
