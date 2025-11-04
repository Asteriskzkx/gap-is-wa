import React from "react";
import { RadioButton, RadioButtonProps } from "primereact/radiobutton";

interface PrimaryRadioButtonProps extends Omit<RadioButtonProps, "pt"> {
  readonly label?: string;
  readonly error?: boolean;
  readonly errorMessage?: string;
}

/**
 * PrimaryRadioButton - Radio button หลักที่ใช้ในระบบ GAP (ใช้ PrimeReact RadioButton)
 *
 * @example
 * <PrimaryRadioButton
 *   value="option1"
 *   name="radioGroup"
 *   inputId="radio1"
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
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 group">
        <RadioButton
          {...props}
          className={`
            primary-radio
            ${error ? "p-invalid" : ""}
            ${className}
          `}
        />
        {label && (
          <label
            htmlFor={props.inputId}
            className="text-sm font-medium text-gray-700 cursor-pointer select-none group-hover:text-green-700 transition-colors"
          >
            {label}
          </label>
        )}
      </div>
      {error && errorMessage && (
        <small className="text-red-600 text-xs ml-6">{errorMessage}</small>
      )}
    </div>
  );
}
