"use client";

import React from "react";
import { InputMask } from "primereact/inputmask";
import { Message } from "primereact/message";

interface PrimaryInputMaskProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly mask?: string;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly className?: string;
  readonly id?: string;
  readonly name?: string;
  readonly autoComplete?: string;
  readonly slotChar?: string;
  readonly autoClear?: boolean;
  readonly invalid?: boolean;
  readonly errorMessage?: string;
}

export default function PrimaryInputMask({
  value,
  onChange,
  mask,
  placeholder = "",
  disabled = false,
  required = false,
  className = "",
  id,
  name,
  autoComplete,
  slotChar = "_",
  autoClear = true,
  invalid = false,
  errorMessage = "",
}: PrimaryInputMaskProps) {
  const handleChange = (e: any) => {
    onChange(e.target.value);
  };

  const inputId =
    id || `inputmask-${Math.random().toString(36).substring(2, 11)}`;

  return (
    <div className="w-full">
      <InputMask
        id={inputId}
        name={name}
        value={value}
        onChange={handleChange}
        mask={mask}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        slotChar={slotChar}
        autoClear={autoClear}
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
