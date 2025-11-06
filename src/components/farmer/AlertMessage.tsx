import React from "react";
import { formStyles } from "@/styles/formStyles";

interface AlertMessageProps {
  type: "error" | "success" | "warning";
  message: string;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  message,
}) => {
  return <div className={formStyles.alert[type]}>{message}</div>;
};
