"use client";

import React from "react";
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
  AutoCompleteChangeEvent,
} from "primereact/autocomplete";

interface Option {
  label: string;
  value: any;
}

interface PrimaryAutoCompleteProps {
  value: any;
  options: Option[];
  onChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export default function PrimaryAutoComplete({
  value,
  options,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  className = "",
  id,
  name,
}: PrimaryAutoCompleteProps) {
  const [filteredOptions, setFilteredOptions] = React.useState<Option[]>([]);
  const [inputValue, setInputValue] = React.useState<string>("");

  // Find the selected option to display its label
  const selectedOption = options.find((opt) => opt.value === value);

  // Update input value when selected option changes
  React.useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else if (value === "" || value === null || value === undefined) {
      setInputValue("");
    }
  }, [value, selectedOption]);

  const searchOptions = (event: AutoCompleteCompleteEvent) => {
    const query = event.query.toLowerCase().trim();

    if (query === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option.label.toLowerCase().includes(query)
      );
      setFilteredOptions(filtered);
    }
  };

  const handleChange = (e: AutoCompleteChangeEvent) => {
    const newValue = e.value;

    // If user selected an option from dropdown (object with value property)
    if (
      newValue &&
      typeof newValue === "object" &&
      newValue.value !== undefined
    ) {
      setInputValue(newValue.label);
      onChange(newValue.value);
    }
    // If user is typing (string input)
    else if (typeof newValue === "string") {
      setInputValue(newValue);
      // Check if the typed text matches any option exactly
      const matchedOption = options.find(
        (opt) => opt.label.toLowerCase() === newValue.toLowerCase()
      );
      if (matchedOption) {
        onChange(matchedOption.value);
      }
    }
    // If cleared
    else if (newValue === null || newValue === undefined) {
      setInputValue("");
      onChange("");
    }
  };

  const handleBlur = () => {
    // On blur, check if current input matches any option
    const matchedOption = options.find(
      (opt) => opt.label.toLowerCase() === inputValue.toLowerCase()
    );

    if (matchedOption) {
      // Input matches an option, ensure value is set
      if (value !== matchedOption.value) {
        onChange(matchedOption.value);
      }
      setInputValue(matchedOption.label);
    } else if (inputValue && !selectedOption) {
      // Input doesn't match any option and no valid selection, clear it
      setInputValue("");
      onChange("");
    } else if (selectedOption) {
      // Restore the selected option's label if user modified input
      setInputValue(selectedOption.label);
    }
  };

  return (
    <AutoComplete
      id={id}
      name={name}
      value={inputValue}
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
      className={`w-full ${className}`}
      inputClassName="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
      panelClassName="autocomplete-panel"
    />
  );
}
