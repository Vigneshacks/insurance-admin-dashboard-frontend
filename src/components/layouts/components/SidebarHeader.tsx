import React from "react";
import { NavLink } from "react-router-dom";
import EnclosingButton from "../../../assets/encloseright";
import MirroredEnclosingButton from "../../../assets/encloseleft";
import Group20 from "../../../assets/deciphertitle";
import Group from "../../../assets/Group";

interface Props {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarHeader: React.FC<Props> = ({ isCollapsed, toggleSidebar }) => {
  return (
    <div>
      <div
        className={`-mt-1 flex items-center justify-between ${isCollapsed ? "flex-col-reverse gap-2" : "flex-row"}`}
      >
        <div className="flex items-center text-xl font-bold">
          {!isCollapsed && (
            <NavLink
              to="/dashboard"
              className="flex items-center text-blue-600"
              style={{
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Group20 />
            </NavLink>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="text-blue-600 hover:cursor-pointer"
          style={{
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
          }}
        >
          {isCollapsed ? <EnclosingButton /> : <MirroredEnclosingButton />}
        </button>
      </div>
       {isCollapsed && <div className="flex justify-center mb-5">
        <Group />
      </div>
}
      <div className="mb-5 border-b border-gray-400"></div>
    </div>
  );
};

export default SidebarHeader;
