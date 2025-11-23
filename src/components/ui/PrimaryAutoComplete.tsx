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

  const inputId =
    id || `autocomplete-${Math.random().toString(36).substring(2, 11)}`;

  // Find the selected option to display its label
  const selectedOption = options.find((opt) => opt.value === value);

  // Update input value when selected option changes
  React.useEffect(() => {
    if (selectedOption) {
      setInputText(selectedOption.label);
    } else if (value === "" || value === null || value === undefined) {
      setInputText("");
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
      setInputText(newValue.label);
      onChange(newValue.value);
    }
    // If user is typing (string input)
    else if (typeof newValue === "string") {
      setInputText(newValue);
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
      setInputText("");
      onChange("");
    }
  };

  const handleBlur = () => {
    // On blur, check if current input matches any option
    const matchedOption = options.find(
      (opt) => opt.label.toLowerCase() === inputText.toLowerCase()
    );

    if (matchedOption) {
      // Input matches an option, ensure value is set
      if (value !== matchedOption.value) {
        onChange(matchedOption.value);
      }
      setInputText(matchedOption.label);
    } else if (inputText && !selectedOption) {
      // Input doesn't match any option and no valid selection, clear it
      setInputText("");
      onChange("");
    } else if (selectedOption) {
      // Restore the selected option's label if user modified input
      setInputText(selectedOption.label);
    }
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
        onBlur={() => { handleBlur(); if (onBlur) onBlur(); }}
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
