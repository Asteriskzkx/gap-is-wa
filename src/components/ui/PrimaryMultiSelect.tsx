"use client";

import React from "react";
import { MultiSelect, MultiSelectProps } from "primereact/multiselect";
import { Message } from "primereact/message";

interface Option {
  label: string;
  value: any;
}

interface GroupedOption {
    label: string;
    code: string;
    items: {
        value: string;
        label: string;
    }[];
  }

interface PrimaryMultiSelectProps extends Omit<MultiSelectProps, "pt"> {
  readonly value: any;
  readonly options: Option[] | GroupedOption[];
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
  readonly display?: "comma" | "chip";
  readonly maxSelectedLabels?: number;
  readonly selectAll?: boolean;
  readonly optionLabel?: string;
  readonly optionGroupLabel?: string;
  readonly optionGroupChildren?: string;
  readonly optionGroupTemplate?: (option: any) => React.ReactNode;
}

/**
 * PrimaryMultiSelect - Multi-select dropdown หลักที่ใช้ในระบบ GAP
 *
 * @example
 * <PrimaryMultiSelect
 *   value={selectedValues}
 *   options={[
 *     { label: "Option 1", value: "opt1" },
 *     { label: "Option 2", value: "opt2" }
 *   ]}
 *   onChange={(value) => setSelectedValues(value)}
 *   placeholder="Select options"
 * />
 */
export default function PrimaryMultiSelect({
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
  display = "comma",
  maxSelectedLabels = 3,
  selectAll = true,
  optionLabel = "label",
  optionGroupLabel,
  optionGroupChildren,
  optionGroupTemplate,
}: PrimaryMultiSelectProps) {
  const handleChange = (e: any) => {
    onChange(e.value);
  };

  const inputId =
    id || `multiselect-${Math.random().toString(36).substring(2, 11)}`;

  return (
    <div className="w-full">
      <MultiSelect
        id={inputId}
        name={name}
        value={value}
        options={options}
        onChange={handleChange}
        optionLabel={optionLabel}
        optionValue="value"
        optionGroupLabel={optionGroupLabel}
        optionGroupChildren={optionGroupChildren}
        optionGroupTemplate={optionGroupTemplate}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        showClear={showClear}
        invalid={invalid}
        display={display}
        maxSelectedLabels={maxSelectedLabels}
        selectAll={selectAll}
        className={`w-full primary-multiselect ${className}`}
        panelClassName="multiselect-panel"
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
