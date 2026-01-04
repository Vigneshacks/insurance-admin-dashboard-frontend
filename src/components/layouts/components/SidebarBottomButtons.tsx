import React, { useState, useEffect } from "react";
import { RiArrowUpSLine, RiArrowDownSLine } from "react-icons/ri";
import SidebarNavLink from "./SidebarNavLink";
import { ActivePageType } from "../../../types/basic.types";
import Avatarprof from "../../../assets/avt"; // Import the new Avatar component
import HelpIcon from "../../../assets/BottomcardIcons/HelpIcon";
import LogoutIcon from "../../../assets/BottomcardIcons/LogOutIcon";
import YourIcon from "../../../assets/BottomcardIcons/Imoji";
import { useAuth0 } from "@auth0/auth0-react";
import api from "../../../services/axios"; // Import the API
import { AppLoader } from "../../../commonComponents/AppLoader";

type Props = {
  isCollapsed: boolean;
  setActivePage: (page: ActivePageType) => void;
};

type UserData = {
  first_name: string;
  last_name: string;
  role: string;
  avatar_url: string | null;
};

const SidebarBottomButtons: React.FC<Props> = ({
  isCollapsed,
  setActivePage,
}) => {
  const { isAuthenticated, logout, isLoading } = useAuth0();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [fetchingUser, setFetchingUser] = useState(false);

  // Fetch user data from API for additional profile info (like avatar)
  useEffect(() => {
    const getUserData = async () => {
      if (!isAuthenticated) return;

      try {
        setFetchingUser(true);
        // Use /api/users/me endpoint or appropriate endpoint to get user details
        const response = await api.get("/api/users/me");
        setUserData(response.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setFetchingUser(false);
      }
    };

    getUserData();
  }, [isAuthenticated]);

  if (isLoading || fetchingUser) {
    return <AppLoader />;
}


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  // useEffect(()=>{console.log("USER******" , userData ? userData : "INvalid");
  // },[])

  console.log("USER******", userData)

  const handleLogout = () => {
    // Use Auth0 logout to log the user out, which will redirect to origin 
    // and trigger the login modal display from App.tsx
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  const displayRole = userData?.role
    ? userData.role.toUpperCase().replace('_', ' ')
    : 'USER';

  const displayName = userData
    ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
    : "Abby Williams";

  return (
    <div className="relative flex h-full flex-col justify-between">
      {isMenuOpen && !isCollapsed && (
        <ul className="absolute bottom-16 left-0 flex w-full flex-col items-start space-y-1 rounded-[5px] border border-[#D8DADC] bg-white p-[5px]">
          <li>
            <SidebarNavLink
              id="feedback"
              isCollapsed={isCollapsed}
              to="/feedback"
              icon={YourIcon}
              label="Send Us Feedback"
              setActivePage={setActivePage}
              className="sidebar-bottom-link"
              isSidebarBottom={true}
            />
          </li>
          <li>
            <SidebarNavLink
              id="help"
              isCollapsed={isCollapsed}
              to="/help"
              icon={HelpIcon}
              label="Help"
              setActivePage={setActivePage}
              className="sidebar-bottom-link"
              isSidebarBottom={true}
            />
          </li>
          <li onClick={handleLogout}>
            <SidebarNavLink
              id="logout"
              isCollapsed={isCollapsed}
              to="#"
              icon={LogoutIcon}
              label="Logout"
              className="sidebar-bottom-link"
              isSidebarBottom={true}
              setActivePage={() => { }}
            />
          </li>
        </ul>
      )}
      <div className="absolute bottom-0 left-0 flex w-full items-center justify-between p-2">
        {isCollapsed ? (
          // When collapsed, show only the Avatar component
          <div className="flex w-full justify-center">
            <Avatarprof
              imageUrl={userData?.avatar_url || "/assets/profilepic.png"}
            />
          </div>
        ) : (
          // When expanded, show the full UserProfile component or custom layout
          <div className="flex items-center gap-2">
            <Avatarprof
              imageUrl={userData?.avatar_url || "/assets/profilepic.png"}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#334155]">
                {displayName}
              </span>
              <span className="text-[10px] text-[#919191]">{displayRole}</span>
            </div>
          </div>
        )}

        {!isCollapsed && (
          <button onClick={toggleMenu} className="text-[#1E4477]">
            {isMenuOpen ? (
              <RiArrowUpSLine size={18} />
            ) : (
              <RiArrowDownSLine size={18} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SidebarBottomButtons;
