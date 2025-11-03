"use client";

import React from "react";
import { Calendar } from "primereact/calendar";

interface PrimaryCalendarProps {
  value: Date | null;
  onChange: (value: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
  view?: "date" | "month" | "year";
  dateFormat?: string;
  showIcon?: boolean;
  minDate?: Date;
  maxDate?: Date;
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
}: PrimaryCalendarProps) {
  const handleChange = (e: any) => {
    onChange(e.value as Date | null);
  };

  return (
    <Calendar
      id={id}
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
      className={`w-full primary-calendar ${className}`}
      inputClassName="w-full"
    />
  );
}
