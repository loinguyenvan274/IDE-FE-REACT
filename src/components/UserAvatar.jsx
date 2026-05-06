import React from 'react';

const UserAvatar = ({ onClick, size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-10 h-10 text-sm"
  };

  return (
    <div 
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full bg-[#c42b1c] flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all border border-white/10 ${className}`}
    >
      LO
    </div>
  );
};

export default UserAvatar;
