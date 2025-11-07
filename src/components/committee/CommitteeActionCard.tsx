import Link from "next/link";
import React from "react";

interface CommitteeActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  colorClass: string;
}

export const CommitteeActionCard: React.FC<CommitteeActionCardProps> = ({
  title,
  description,
  href,
  icon,
  colorClass,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
      <Link href={href} className="block">
        <div className="flex flex-col h-full">
          <div
            className={`p-3 rounded-full mb-4 w-12 h-12 flex items-center justify-center ${colorClass}`}
          >
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 flex-grow">{description}</p>
          <div className="mt-4 flex items-center text-indigo-600 font-medium text-sm">
            <span>เข้าสู่เมนู</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CommitteeActionCard;
