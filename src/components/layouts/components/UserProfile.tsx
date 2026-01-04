import React from "react";

type Props = {
  profilePicture: string;
  username: string;
  role: string;
  isCollapsed: boolean;
};

const UserProfile: React.FC<Props> = ({
  profilePicture,
  username,
  role,
  isCollapsed,
}) => {
  return (
    <div className="flex items-center space-x-2 p-2">
      <img
        src={profilePicture}
        alt="Profile"
        className="h-8 w-8 rounded-full"
      />
      {!isCollapsed && (
        <div>
          <span className="text-sm">{username}</span>
          <div className="text-xs text-gray-500 uppercase">{role}</div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
