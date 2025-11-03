"use client";

import React, { useEffect, useRef } from "react";
import { Password } from "primereact/password";
import { Tooltip } from "primereact/tooltip";

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (invalid && errorMessage && containerRef.current) {
      // Force show tooltip on the input inside Password component
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
