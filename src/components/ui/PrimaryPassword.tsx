"use client";

import React from "react";
import { Password } from "primereact/password";
import { Message } from "primereact/message";

interface PrimaryPasswordProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly className?: string;
  readonly id?: string;
  readonly name?: string;
  readonly autoComplete?: string;
  readonly feedback?: boolean;
  readonly toggleMask?: boolean;
  readonly weakLabel?: string;
  readonly mediumLabel?: string;
  readonly strongLabel?: string;
  readonly invalid?: boolean;
  readonly errorMessage?: string;
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
  invalid = false,
  errorMessage = "",
}: PrimaryPasswordProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const inputId =
    id || `password-${Math.random().toString(36).substring(2, 11)}`;

  return (
    <div className="w-full">
      <Password
        inputId={inputId}
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
        invalid={invalid}
        className={`w-full primary-password ${className}`}
        inputClassName="w-full"
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
