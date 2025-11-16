"use client";

import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryCalendar from "@/components/ui/PrimaryCalendar";
import React from "react";

interface Props {
  from?: Date | null;
  to?: Date | null;
  onSearch: (payload: { from?: Date | null; to?: Date | null }) => void;
}

export default function IssueFilter({ from, to, onSearch }: Props) {
  const [start, setStart] = React.useState<Date | null>(from ?? null);
  const [end, setEnd] = React.useState<Date | null>(to ?? null);

  const startId = React.useMemo(
    () => `issue-start-${Math.random().toString(36).slice(2, 9)}`,
    []
  );
  const endId = React.useMemo(
    () => `issue-end-${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch({ from: start, to: end });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full items-center">
        <div className="w-full sm:w-full">
          <div>
            <label
              htmlFor={startId}
              className="block text-sm text-gray-600 mb-1"
            >
              ตั้งแต่
            </label>
            <PrimaryCalendar
              id={startId}
              value={start}
              onChange={setStart}
              placeholder="เลือกวันที่เริ่ม"
            />
          </div>
        </div>

        <div className="w-full sm:w-full">
          <div>
            <label htmlFor={endId} className="block text-sm text-gray-600 mb-1">
              ถึง
            </label>
            <PrimaryCalendar
              id={endId}
              value={end}
              onChange={setEnd}
              placeholder="เลือกวันที่สิ้นสุด"
            />
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="justify-self-end">
          <PrimaryButton type="submit" label="ค้นหา" icon="pi pi-search" />
        </div>
        <div>
          <PrimaryButton
            type="button"
            color="secondary"
            label="ล้างค่า"
            icon="pi pi-refresh"
            onClick={() => {
              setStart(null);
              setEnd(null);
              onSearch({ from: undefined, to: undefined });
            }}
          />
        </div>
      </div>
    </form>
  );
}
