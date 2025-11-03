"use client";

import React, { useEffect, useRef } from "react";
import { Calendar } from "primereact/calendar";
import { Tooltip } from "primereact/tooltip";

interface PrimaryCalendarProps {
  readonly value: Date | null;
  readonly onChange: (value: Date | null) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly className?: string;
  readonly id?: string;
  readonly name?: string;
  readonly view?: "date" | "month" | "year";
  readonly dateFormat?: string;
  readonly showIcon?: boolean;
  readonly minDate?: Date;
  readonly maxDate?: Date;
  readonly invalid?: boolean;
  readonly errorMessage?: string;
}

export default function PrimaryCalendar({
  value,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  className = "",
  id,
  name,
  view = "date",
  dateFormat = "dd/mm/yy",
  showIcon = true,
  minDate,
  maxDate,
  invalid = false,
  errorMessage = "",
}: PrimaryCalendarProps) {
  const handleChange = (e: any) => {
    onChange(e.value as Date | null);
  };

  const inputId =
    id || `calendar-${Math.random().toString(36).substring(2, 11)}`;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (invalid && errorMessage && containerRef.current) {
      const input = containerRef.current.querySelector("input");
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
      <Calendar
        id={inputId}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        view={view}
        dateFormat={dateFormat}
        showIcon={showIcon}
        minDate={minDate}
        maxDate={maxDate}
        invalid={invalid}
        className={`w-full primary-calendar ${className}`}
        inputClassName="w-full"
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
