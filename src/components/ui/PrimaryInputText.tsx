"use client";

import React from "react";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";

interface PrimaryInputTextProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onBlur?: () => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly className?: string;
  readonly id?: string;
  readonly name?: string;
  readonly maxLength?: number;
  readonly type?: string;
  readonly autoComplete?: string;
  readonly invalid?: boolean;
  readonly errorMessage?: string;
}

export default function PrimaryInputText({
  value,
  onChange,
  onBlur,
  placeholder = "",
  disabled = false,
  required = false,
  className = "",
  id,
  name,
  maxLength,
  type = "text",
  autoComplete,
  invalid = false,
  errorMessage = "",
}: PrimaryInputTextProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;

  return (
    <div className="w-full">
      <InputText
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        invalid={invalid}
        className={`w-full ${className}`}
      />
      {invalid && errorMessage && (
        <Message
          severity="error"
          text={errorMessage}
          className="mt-1 w-full"
          pt={{
            root: { className: "rounded-md" },
            text: { className: "text-sm" },
          }}
        />
      )}
    </div>
  );
}
