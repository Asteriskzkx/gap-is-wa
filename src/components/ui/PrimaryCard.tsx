import { Card, CardProps } from "primereact/card";
import React from "react";

interface PrimaryCardProps extends Omit<CardProps, "className"> {
  className?: string;
  variant?: "default" | "highlight" | "warning";
  hoverable?: boolean;
}

const PrimaryCard: React.FC<PrimaryCardProps> = ({
  className = "",
  variant = "default",
  hoverable = false,
  children,
  ...props
}) => {
  const variantClasses = {
    default: "bg-white border-gray-200",
    highlight: "bg-blue-50 border-blue-200",
    warning: "bg-yellow-50 border-yellow-100",
  };

  const hoverClass = hoverable ? "hover:shadow-md transition-shadow" : "";

  return (
    <Card
      className={`rounded-xl shadow-sm border ${variantClasses[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </Card>
  );
};

export default PrimaryCard;
