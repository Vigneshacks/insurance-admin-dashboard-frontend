import React from 'react';

interface AvatarProps {
  imageUrl?: string;
}

const Avatarprof: React.FC<AvatarProps> = ({ imageUrl = '/assets/images.png' }) => (
  <div 
    className="flex-shrink-0 w-10 h-10 rounded-full border-[0.161px] border-[#d8dadc]" 
    style={{ 
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: '50%', 
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: 'lightgray'
    }}
  />
);

export default Avatarprof;