"use client";

import React from "react";
import { InputMask } from "primereact/inputmask";

interface PrimaryInputMaskProps {
  value: string;
  onChange: (value: string) => void;
  mask?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  slotChar?: string;
  autoClear?: boolean;
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
}: PrimaryInputMaskProps) {
  const handleChange = (e: any) => {
    onChange(e.target.value);
  };

  return (
    <InputMask
      id={id}
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
      className={`w-full ${className}`}
    />
  );
}
