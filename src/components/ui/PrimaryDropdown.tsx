"use client";

import React from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Message } from "primereact/message";

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

  return (
    <div className="w-full">
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
