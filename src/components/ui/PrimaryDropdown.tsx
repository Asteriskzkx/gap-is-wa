"use client";

import React, { useEffect, useRef } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Tooltip } from "primereact/tooltip";

interface Option {
  label: string;
  value: any;
}

interface PrimaryDropdownProps {
  readonly value: any;
  readonly options: Option[];
  readonly onChange: (value: any) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly className?: string;
  readonly id?: string;
  readonly name?: string;
  readonly showClear?: boolean;
  readonly invalid?: boolean;
  readonly errorMessage?: string;
}

export default function PrimaryDropdown({
  value,
  options,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  className = "",
  id,
  name,
  showClear = false,
  invalid = false,
  errorMessage = "",
}: PrimaryDropdownProps) {
  const handleChange = (e: DropdownChangeEvent) => {
    onChange(e.value);
  };

  const inputId =
    id || `dropdown-${Math.random().toString(36).substring(2, 11)}`;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (invalid && errorMessage && containerRef.current) {
      const input = containerRef.current.querySelector(
        "input, .p-dropdown"
      ) as HTMLElement;
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
      <Dropdown
        id={inputId}
        name={name}
        value={value}
        options={options}
        onChange={handleChange}
        optionLabel="label"
        optionValue="value"
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        showClear={showClear}
        invalid={invalid}
        className={`w-full primary-dropdown ${className}`}
        panelClassName="dropdown-panel"
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
