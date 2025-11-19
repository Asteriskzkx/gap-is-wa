"use client";

import React from "react";
import { Calendar } from "primereact/calendar";
import { Message } from "primereact/message";

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
  readonly showTime?: boolean;
  readonly hourFormat?: "12" | "24";
  readonly timeOnly?: boolean;
  readonly minDate?: Date | null;
  readonly maxDate?: Date | null;
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
  showTime = false,
  hourFormat = "24",
  timeOnly = false,
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

  return (
    <div className="w-full">
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
        showTime={showTime}
        hourFormat={hourFormat}
        timeOnly={timeOnly}
        minDate={minDate ?? undefined}
        maxDate={maxDate ?? undefined}
        invalid={invalid}
        className={`w-full primary-calendar ${className}`}
        inputClassName="w-full"
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
