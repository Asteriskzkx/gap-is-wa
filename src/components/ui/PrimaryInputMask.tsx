"use client";

import React, { useEffect, useRef } from "react";
import { InputMask } from "primereact/inputmask";
import { Tooltip } from "primereact/tooltip";

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
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (invalid && errorMessage && inputRef.current) {
      const input = inputRef.current.getElement();
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
    <div className="w-full">
      <InputMask
        ref={inputRef}
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
