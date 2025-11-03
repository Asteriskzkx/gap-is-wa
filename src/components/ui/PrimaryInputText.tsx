"use client";

import React from "react";
import { InputText } from "primereact/inputtext";

interface PrimaryInputTextProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly className?: string;
  readonly id?: string;
  readonly name?: string;
  readonly maxLength?: number;
  readonly type?: string;
  readonly autoComplete?: string;
}

export default function PrimaryInputText({
  value,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  className = "",
  id,
  name,
  maxLength,
  type = "text",
  autoComplete,
}: PrimaryInputTextProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <InputText
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      maxLength={maxLength}
      autoComplete={autoComplete}
      className={`w-full ${className}`}
    />
  );
}
