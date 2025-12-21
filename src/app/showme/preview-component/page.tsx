"use client";

import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryInputTextarea from "@/components/ui/PrimaryInputTextarea";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import toast from "react-hot-toast";
import { ThaiDatePicker } from "thaidatepicker-react";

export default function PreviewComponentPage() {
  const [date, setDate] = useState<Date | null>(null);
  const [visible, setVisible] = useState(false);
  const [textAreaValue, setTextAreaValue] = useState("");

  const [selectedDate, setSelectedDate] = useState("2025-12-21");
  const [selectedThaiDate, setSelectedThaiDate] = useState("2568-12-21");

  const handleDatePickerChange = (christDate: string, buddhistDate: string) => {
    console.log(christDate);
    console.log(buddhistDate);
    setSelectedDate(christDate);
    setSelectedThaiDate(buddhistDate);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-green-800 mb-4">
            ทดสอบ Components
          </h1>

          {/* Calendar Test */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              1. Calendar (ปฏิทิน)
            </h2>

            {/* Date Picker */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือกวันที่ (Date)
                </label>
                <Calendar
                  value={date}
                  onChange={(e) => setDate(e.value as Date)}
                  showIcon
                  placeholder="เลือกวันที่"
                  dateFormat="dd/mm/yy"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือกเดือน (Month)
                </label>
                <Calendar
                  value={date}
                  onChange={(e) => setDate(e.value as Date)}
                  view="month"
                  dateFormat="MM/yy"
                  showIcon
                  placeholder="เลือกเดือน"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือกปี (Year)
                </label>
                <Calendar
                  value={date}
                  onChange={(e) => setDate(e.value as Date)}
                  view="year"
                  dateFormat="yy"
                  showIcon
                  placeholder="เลือกปี"
                  className="w-full"
                />
              </div>
            </div>

            {date && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  <strong>วันที่เลือก:</strong>{" "}
                  {date.toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Button Test */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              2. Buttons (ปุ่ม)
            </h2>
            <div className="flex gap-4 flex-wrap">
              <PrimaryButton
                label="ปุ่มหลัก"
                icon="pi pi-check"
                onClick={() => alert("คลิกปุ่มหลัก")}
              />
              <PrimaryButton
                label="ปุ่มรอง"
                variant="outlined"
                color="secondary"
                icon="pi pi-times"
                onClick={() => alert("คลิกปุ่มรอง")}
              />
              <PrimaryButton
                label="ปุ่มลบ"
                color="danger"
                icon="pi pi-trash"
                onClick={() => alert("คลิกปุ่มลบ")}
              />
              <PrimaryButton label="กำลังโหลด..." loading={true} />
            </div>
          </div>

          {/* Dialog Test */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              3. Dialog (กล่องข้อความ)
            </h2>
            <Button
              label="เปิด Dialog"
              icon="pi pi-external-link"
              onClick={() => setVisible(true)}
            />

            <Dialog
              header="ยืนยันการทำงาน"
              visible={visible}
              style={{ width: "450px" }}
              onHide={() => setVisible(false)}
              footer={
                <div>
                  <Button
                    label="ยกเลิก"
                    icon="pi pi-times"
                    onClick={() => setVisible(false)}
                    className="p-button-text"
                  />
                  <Button
                    label="ยืนยัน"
                    icon="pi pi-check"
                    onClick={() => {
                      alert("ยืนยันแล้ว!");
                      setVisible(false);
                    }}
                    autoFocus
                  />
                </div>
              }
            >
              <p className="m-0">คุณต้องการดำเนินการต่อหรือไม่?</p>
            </Dialog>
          </div>

          {/* Toast Test (react-hot-toast)*/}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              4. Toast (ข้อความแจ้งเตือน)
            </h2>
            <div className="flex gap-4 flex-wrap">
              <PrimaryButton
                label="Toast Success"
                icon="pi pi-check"
                onClick={() => toast.success("Success")}
              />
              <PrimaryButton
                label="Toast Error"
                icon="pi pi-times"
                onClick={() => toast.error("Error")}
              />
              <PrimaryButton
                label="Toast Loading"
                icon="pi pi-info-circle"
                onClick={() => toast.loading("Loading")}
              />
            </div>
          </div>

          {/* InputTextarea */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              5. InputTextarea (กล่องข้อความหลายบรรทัด)
            </h2>
            <div className="w-full ">
              <PrimaryInputTextarea
                value={textAreaValue}
                onChange={(val) => setTextAreaValue(val)}
                placeholder="พิมพ์ข้อความที่นี่..."
                rows={5}
                className="border border-gray-300"
              />
            </div>
          </div>

          {/* ThaiDatePicker */}
          <div className="mb-8">
            <ThaiDatePicker
              value={selectedDate}
              onChange={handleDatePickerChange}
              // reactDatePickerProps={{
              //   customInput: <input className="w-full bg-blue-300" />,
              // }}
            />
            <div>christDate: {selectedDate}</div>
            <div>thaiDate: {selectedThaiDate}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
