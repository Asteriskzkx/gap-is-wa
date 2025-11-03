"use client";

import React from "react";
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from "primereact/inputnumber";

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
}: PrimaryInputNumberProps) {
  const handleChange = (e: InputNumberValueChangeEvent) => {
    onChange(e.value ?? null);
  };

  return (
    <InputNumber
      id={id}
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
      className={`w-full ${className}`}
    />
  );
}
