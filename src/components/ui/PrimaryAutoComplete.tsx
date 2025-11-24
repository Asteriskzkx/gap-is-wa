"use client";

import React from "react";
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
  AutoCompleteChangeEvent,
} from "primereact/autocomplete";
import { Message } from "primereact/message";

interface Option {
  label: string;
  value: any;
}

interface PrimaryAutoCompleteProps {
  readonly value: any;
  readonly options: Option[];
  readonly onChange: (value: any) => void;
  readonly onBlur?: () => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly className?: string;
  readonly id?: string;
  readonly name?: string;
  readonly invalid?: boolean;
  readonly errorMessage?: string;
}

export default function PrimaryAutoComplete({
  value,
  options,
  onChange,
  onBlur,
  placeholder = "",
  disabled = false,
  required = false,
  className = "",
  id,
  name,
  invalid = false,
  errorMessage = "",
}: PrimaryAutoCompleteProps) {
  const [filteredOptions, setFilteredOptions] = React.useState<Option[]>([]);
  const [inputText, setInputText] = React.useState<string>("");
  const prevValueRef = React.useRef(value);

  const inputId =
    id || `autocomplete-${Math.random().toString(36).substring(2, 11)}`;

  // Find the selected option to display its label
  const selectedOption = options.find((opt) => opt.value === value);

  // Update input value only when value actually changes (not on every render)
  React.useEffect(() => {
    if (value !== prevValueRef.current) {
      // value changed (controlled from parent) -> update prev ref and input text
      prevValueRef.current = value;
      if (selectedOption) {
        setInputText(selectedOption.label);
      } else if (value === "" || value === null || value === undefined) {
        setInputText("");
      }
      return;
    }

    // If value did not change but selectedOption became available (for example
    // options were loaded asynchronously), ensure inputText shows the option's
    // label. We compare with current inputText to avoid unnecessary state updates.
    if (selectedOption && inputText !== selectedOption.label) {
      setInputText(selectedOption.label);
    }
  }, [value, selectedOption, inputText]);

  const searchOptions = (event: AutoCompleteCompleteEvent) => {
    const query = event.query?.toLowerCase().trim() || "";
    setFilteredOptions(
      options.filter((option) => option.label.toLowerCase().includes(query))
    );
  };

  const handleChange = (e: AutoCompleteChangeEvent) => {
    const newValue = e.value;

    // ถ้าเลือกจาก dropdown → newValue เป็น object ที่มี label + value
    if (newValue && typeof newValue === "object" && "value" in newValue) {
      setInputText(newValue.label);
      onChange(newValue.value);
      return;
    }

    // ถ้าล้างค่า (null/undefined)
    if (newValue === null || newValue === undefined) {
      setInputText("");
      onChange("");
      return;
    }

    // ถ้ากำลังพิมพ์ → newValue เป็น string
    if (typeof newValue === "string") {
      setInputText(newValue);
      // ถ้ามี option ที่ตรงแบบ exact match ให้ set value ไปเลย
      const matchedOption = options.find(
        (opt) => opt.label.toLowerCase() === newValue.toLowerCase()
      );
      if (matchedOption) {
        onChange(matchedOption.value);
      }
    }
  };

  const handleBlur = () => {
    // ถ้า inputText ไม่ว่าง และมี selected option ให้ ensure ว่า value ถูก set
    if (inputText && selectedOption) {
      onChange(selectedOption.value);
      return;
    }

    // ถ้า inputText ว่าง ให้ล้างค่า
    if (!inputText) {
      onChange("");
      return;
    }

    // ถ้า inputText มีแต่ไม่ match option ใด → ค้นหา exact match
    const matchedOption = options.find(
      (opt) => opt.label.toLowerCase() === inputText.toLowerCase()
    );

    if (matchedOption) {
      onChange(matchedOption.value);
    } else {
      // ไม่มี match → ล้างค่า
      setInputText("");
      onChange("");
    }

    if (onBlur) onBlur();
  };

  return (
    <div className="w-full">
      <AutoComplete
        id={inputId}
        name={name}
        value={inputText}
        suggestions={filteredOptions}
        completeMethod={searchOptions}
        onChange={handleChange}
        onBlur={handleBlur}
        field="label"
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        dropdown
        showEmptyMessage
        emptyMessage="ไม่พบข้อมูล"
        invalid={invalid}
        className={`w-full ${className}`}
        inputClassName="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
        panelClassName="autocomplete-panel"
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
