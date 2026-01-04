import { useState } from "react";
import { ActivePageType } from "../../types/ActivePageType";
import SidebarHeader from "./components/SidebarHeader";
import SidebarTopButtons from "./components/SidebarTopButtons";
import SidebarBottomButtons from "./components/SidebarBottomButtons";
// Define props type
type Props = {
  activePage: ActivePageType;
  setActivePage: (activePage: ActivePageType) => void;
};

const Sidebar = (props: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setIsCollapsed((prevState) => {
      // even if icons are collapsed, icons should expand when dashboard should be open
      if (!prevState) setIsDashboardOpen(true);
      return !prevState;
    });
  };

  const toggleDashboard = () => {
    setIsDashboardOpen((prevState) => {
      return !prevState;
    });
  };

  return (
    <div
      className={`transition-width flex h-screen flex-col items-center justify-between p-3 duration-300 ${
        isCollapsed ? "w-[60px]" : "w-[256px]"
      }`}
      style={{
        paddingTop: "30px",
        paddingRight: "25px",
        paddingBottom: "20px",
        paddingLeft: "25px",
        gap: "20px",
      }}
    >
      <div
        className={`transition-width flex h-screen flex-col p-3 duration-300 ${isCollapsed ? "w-[60px]" : "w-[214px]"}`}
      >
        <SidebarHeader
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
        />
        <div className="mt-2 flex flex-grow flex-col gap-4">
          <SidebarTopButtons
            isDashboardOpen={isDashboardOpen}
            toggleDashboard={toggleDashboard}
            isCollapsed={isCollapsed}
            setActivePage={props.setActivePage}
          />
          <div className="flex-grow"></div>
          <SidebarBottomButtons
            // isDashboardOpen={isDashboardOpen}
            // toggleDashboard={toggleDashboard}
            isCollapsed={isCollapsed}
            setActivePage={props.setActivePage}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
