"use client";

import React, { useEffect, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Tooltip } from "primereact/tooltip";

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
  readonly invalid?: boolean;
  readonly errorMessage?: string;
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
  invalid = false,
  errorMessage = "",
}: PrimaryInputTextProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (invalid && errorMessage && inputRef.current) {
      // Force show tooltip
      const event = new MouseEvent("mouseenter", {
        bubbles: true,
        cancelable: true,
      });
      inputRef.current.dispatchEvent(event);
    }
  }, [invalid, errorMessage]);

  return (
    <div className="w-full">
      <InputText
        ref={inputRef}
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        invalid={invalid}
        className={`w-full ${className}`}
        data-pr-tooltip={invalid && errorMessage ? errorMessage : undefined}
        data-pr-position="bottom"
      />
      {invalid && errorMessage && (
        <Tooltip
          target={`#${inputId}`}
          position="bottom"
          className="error-tooltip"
          mouseTrack={false}
          autoHide={false}
          showDelay={0}
          hideDelay={0}
          pt={{
            text: { className: "bg-red-600 text-white p-2 rounded shadow-lg" },
            arrow: { className: "border-red-600" },
          }}
        />
      )}
    </div>
  );
}
