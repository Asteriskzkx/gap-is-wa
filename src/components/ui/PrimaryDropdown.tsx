"use client";

import React from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

interface Option {
  label: string;
  value: any;
}

interface PrimaryDropdownProps {
  value: any;
  options: Option[];
  onChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
  showClear?: boolean;
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
}: PrimaryDropdownProps) {
  const handleChange = (e: DropdownChangeEvent) => {
    onChange(e.value);
  };

  return (
    <Dropdown
      id={id}
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
      className={`w-full ${className}`}
      panelClassName="dropdown-panel"
    />
  );
}
