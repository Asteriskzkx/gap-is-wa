import React from "react";

interface StatusBadgeProps {
  text: string;
  color: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ text, color }) => {
  return (
    <span
      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}
    >
      {text}
    </span>
  );
};
