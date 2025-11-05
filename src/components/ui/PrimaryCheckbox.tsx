import React from "react";

interface PrimaryCheckboxProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly id?: string;
  readonly label?: string;
}

/**
 * PrimaryCheckbox - Checkbox component ที่ใช้ HTML checkbox พื้นฐานแต่ style ให้สวยและสอดคล้องกับระบบ GAP
 *
 * @example
 * <PrimaryCheckbox
 *   checked={isChecked}
 *   onChange={(checked) => setIsChecked(checked)}
 *   label="เลือกรายการนี้"
 * />
 */
export default function PrimaryCheckbox({
  checked,
  onChange,
  disabled = false,
  className = "",
  id,
  label,
}: PrimaryCheckboxProps) {
  // ถ้าไม่มี label ให้ return checkbox เดี่ยวๆ ไม่ต้อง wrap ด้วย div
  if (!label) {
    return (
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={`
          h-5 w-5
          bg-white
          border-2 border-gray-300
          rounded
          cursor-pointer
          transition-colors duration-200
          hover:border-green-500
          focus:ring-2 focus:ring-green-500 focus:ring-offset-0
          disabled:opacity-50 disabled:cursor-not-allowed
          accent-green-600
          ${className}
        `}
      />
    );
  }

  // ถ้ามี label ให้ wrap ด้วย div เพื่อจัด layout
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={`
          h-5 w-5
          bg-white
          border-2 border-gray-300
          rounded
          cursor-pointer
          transition-colors duration-200
          hover:border-green-500
          focus:ring-2 focus:ring-green-500 focus:ring-offset-0
          disabled:opacity-50 disabled:cursor-not-allowed
          accent-green-600
          ${className}
        `}
      />
      <label
        htmlFor={id}
        className={`
          text-sm font-medium text-gray-700 
          select-none
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:text-green-700"
          }
          transition-colors duration-200
        `}
      >
        {label}
      </label>
    </div>
  );
}
