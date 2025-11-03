"use client";

import React, { useEffect, useRef } from "react";
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from "primereact/inputnumber";
import { Tooltip } from "primereact/tooltip";

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (invalid && errorMessage && containerRef.current) {
      const input = containerRef.current.querySelector("input");
      if (input) {
        const event = new MouseEvent("mouseenter", {
          bubbles: true,
          cancelable: true,
        });
        input.dispatchEvent(event);
      }
    }
  }, [invalid, errorMessage]);

  return (
    <div className="w-full" ref={containerRef}>
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
