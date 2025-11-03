"use client";

import React from "react";
import { Password } from "primereact/password";

interface PrimaryPasswordProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  feedback?: boolean;
  toggleMask?: boolean;
  weakLabel?: string;
  mediumLabel?: string;
  strongLabel?: string;
}

export default function PrimaryPassword({
  value,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  className = "",
  id,
  name,
  autoComplete,
  feedback = false,
  toggleMask = true,
  weakLabel = "อ่อนแอ",
  mediumLabel = "ปานกลาง",
  strongLabel = "แข็งแรง",
}: PrimaryPasswordProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Password
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      autoComplete={autoComplete}
      feedback={feedback}
      toggleMask={toggleMask}
      weakLabel={weakLabel}
      mediumLabel={mediumLabel}
      strongLabel={strongLabel}
      className={`w-full primary-password ${className}`}
      inputClassName="w-full"
    />
  );
}
