import React from "react";
import { RadioButton, RadioButtonProps } from "primereact/radiobutton";

interface PrimaryRadioButtonProps extends Omit<RadioButtonProps, "pt"> {
  readonly label?: string;
  readonly error?: boolean;
  readonly errorMessage?: string;
}

/**
 * PrimaryRadioButton - Radio button หลักที่ใช้ในระบบ GAP
 *
 * @example
 * <PrimaryRadioButton
 *   value="option1"
 *   checked={selectedValue === "option1"}
 *   onChange={(e) => setSelectedValue(e.value)}
 *   label="ตัวเลือก 1"
 * />
 */
export default function PrimaryRadioButton({
  label,
  error = false,
  errorMessage,
  className = "",
  ...props
}: PrimaryRadioButtonProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <RadioButton
          {...props}
          className={`${className} ${error ? "p-invalid" : ""}`}
        />
        {label && (
          <label
            htmlFor={props.inputId}
            className="ml-2 text-sm text-gray-700 cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
      {error && errorMessage && (
        <small className="text-red-600 mt-1">{errorMessage}</small>
      )}
    </div>
  );
}
