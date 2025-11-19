"use client";

import React from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";

interface PrimaryInputTextareaProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly className?: string;
  readonly id?: string;
  readonly name?: string;
  readonly rows?: number;
  readonly cols?: number;
  readonly autoResize?: boolean;
  readonly maxLength?: number;
  readonly invalid?: boolean;
  readonly errorMessage?: string;
}

export default function PrimaryInputTextarea({
  value,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  className = "",
  id,
  name,
  rows = 3,
  cols,
  autoResize = true,
  maxLength,
  invalid = false,
  errorMessage = "",
}: PrimaryInputTextareaProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const inputId =
    id || `textarea-${Math.random().toString(36).substring(2, 11)}`;

  return (
    <div className="w-full">
      <InputTextarea
        id={inputId}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        cols={cols}
        autoResize={autoResize}
        maxLength={maxLength}
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
