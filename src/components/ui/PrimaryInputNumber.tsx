"use client";

import React from "react";
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from "primereact/inputnumber";
import { Message } from "primereact/message";

interface PrimaryInputNumberProps {
  readonly value: number | null;
  readonly onChange: (value: number | null) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly className?: string;
  readonly id?: string;
  readonly name?: string;
  readonly min?: number;
  readonly max?: number;
  readonly minFractionDigits?: number;
  readonly maxFractionDigits?: number;
  readonly mode?: "decimal" | "currency";
  readonly useGrouping?: boolean;
  readonly invalid?: boolean;
  readonly errorMessage?: string;
}

export default function PrimaryInputNumber({
  value,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  className = "",
  id,
  name,
  min,
  max,
  minFractionDigits = 0,
  maxFractionDigits = 4,
  mode = "decimal",
  useGrouping = false,
  invalid = false,
  errorMessage = "",
}: PrimaryInputNumberProps) {
  const handleChange = (e: InputNumberValueChangeEvent) => {
    onChange(e.value ?? null);
  };

  const inputId =
    id || `inputnumber-${Math.random().toString(36).substring(2, 11)}`;

  return (
    <div className="w-full">
      <InputNumber
        inputId={inputId}
        name={name}
        value={value}
        onValueChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        minFractionDigits={minFractionDigits}
        maxFractionDigits={maxFractionDigits}
        mode={mode}
        useGrouping={useGrouping}
        invalid={invalid}
        className={`w-full ${className}`}
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
