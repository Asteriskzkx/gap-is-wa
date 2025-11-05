import Link from "next/link";
import React from "react";

interface StatusCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  textColor: string;
  linkText: string;
  linkHref: string;
  linkTextColor: string;
  additionalInfo?: React.ReactNode;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  count,
  icon,
  bgColor,
  borderColor,
  textColor,
  linkText,
  linkHref,
  linkTextColor,
  additionalInfo,
}) => {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-3 sm:p-4`}>
      <div className="flex items-start">
        {icon}
        <div>
          <h3 className={`text-base font-medium ${textColor}`}>
            {count} รายการ
          </h3>
          <p className={`text-sm ${textColor.replace("800", "700")} mt-1`}>
            {title}
          </p>
        </div>
      </div>
      <div
        className={`mt-2 pt-2 border-t ${borderColor.replace("100", "200")}`}
      >
        {additionalInfo || (
          <Link
            href={linkHref}
            className={`text-xs ${linkTextColor} hover:${linkTextColor.replace(
              "600",
              "800"
            )} flex items-center mt-1`}
          >
            {linkText}
            <svg
              className="w-3 h-3 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
};
