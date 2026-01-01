"use client";

import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryInputTextarea from "@/components/ui/PrimaryInputTextarea";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import toast from "react-hot-toast";
import { ThaiDatePicker } from "thaidatepicker-react";
import { usePreviewComponent } from "./usePreviewComponent";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Set default font for all charts
ChartJS.defaults.font.family =
  "var(--font-sarabun), ui-sans-serif, system-ui, sans-serif";

export default function PreviewComponentPage() {
  const {
    date,
    setDate,
    visible,
    setVisible,
    textAreaValue,
    setTextAreaValue,
    selectedDate,
    selectedThaiDate,
    handleDatePickerChange,
    chartRef,
    floatingChartRef,
    horizontalChartRef,
    stackedChartRef,
    stackedGroupsChartRef,
    verticalChartRef,
    interpolationChartRef,
    lineChartRef,
    multiAxisChartRef,
    pointStylingChartRef,
    segmentsChartRef,
    steppedChartRef,
    stylingChartRef,
  } = usePreviewComponent();

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
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              6. ThaiDatePicker (ตัวเลือกวันที่แบบพุทธศักราช)
            </h2>
            <div className="w-full ">
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

          {/* ChartJS  */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              7. ChartJS (กราฟ)
            </h2>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                7.1 Bar Charts
              </h3>
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-600 mb-3">
                  7.1.1 Bar Chart Border Radius
                </h4>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <canvas ref={chartRef} id="barChartBorderRadius"></canvas>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>คุณสมบัติ:</strong> ใช้{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      borderRadius
                    </code>{" "}
                    เพื่อทำมุมโค้งของแท่งกราฟ และ{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      borderSkipped: false
                    </code>{" "}
                    เพื่อให้ทุกมุมโค้ง
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-600 mb-3">
                  7.1.2 Floating Bars
                </h4>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <canvas ref={floatingChartRef} id="floatingBarChart"></canvas>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>คุณสมบัติ:</strong> ใช้ข้อมูลแบบอาร์เรย์ [min, max]
                    เพื่อแสดงช่วงค่า เหมาะสำหรับแสดงช่วงอุณหภูมิ ราคา
                    หรือค่าที่มีช่วง
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-600 mb-3">
                  7.1.3 Horizontal Bar Chart
                </h4>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <canvas
                    ref={horizontalChartRef}
                    id="horizontalBarChart"
                  ></canvas>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>คุณสมบัติ:</strong> ใช้{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      indexAxis: &quot;y&quot;
                    </code>{" "}
                    เพื่อสร้างกราฟแท่งแนวนอน เหมาะสำหรับเปรียบเทียบหมวดหมู่
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-600 mb-3">
                  7.1.4 Stacked Bar Chart
                </h4>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <canvas ref={stackedChartRef} id="stackedBarChart"></canvas>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>คุณสมบัติ:</strong> ใช้{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      scales.x.stacked: true
                    </code>{" "}
                    และ{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      scales.y.stacked: true
                    </code>{" "}
                    เพื่อซ้อนข้อมูลแต่ละชุด แสดงผลรวมทั้งหมด
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-600 mb-3">
                  7.1.5 Stacked Bar Chart with Groups
                </h4>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <canvas
                    ref={stackedGroupsChartRef}
                    id="stackedGroupsChart"
                  ></canvas>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>คุณสมบัติ:</strong> ใช้{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">stack</code>{" "}
                    property ในแต่ละ dataset
                    เพื่อจัดกลุ่มข้อมูลที่ต้องการซ้อนด้วยกัน
                    เหมาะสำหรับเปรียบเทียบหลายกลุ่ม
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-600 mb-3">
                  7.1.6 Vertical Bar Chart
                </h4>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <canvas ref={verticalChartRef} id="verticalBarChart"></canvas>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>คุณสมบัติ:</strong> กราฟแท่งแนวตั้งแบบมาตรฐาน
                    เหมาะสำหรับแสดงข้อมูลเปรียบเทียบตามช่วงเวลา เช่น รายเดือน
                    รายปี
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-700 mb-2 mt-8">
                7.2 Line Charts
              </h3>

              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-600 mb-3">
                  7.2.1 Interpolation Modes
                </h4>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <canvas
                    ref={interpolationChartRef}
                    id="interpolationChart"
                  ></canvas>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>คุณสมบัติ:</strong> ใช้{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      cubicInterpolationMode
                    </code>{" "}
                    เพื่อเปลี่ยนรูปแบบการเชื่อมเส้น (default, monotone)
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-600 mb-3">
                  7.2.2 Basic Line Chart
                </h4>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <canvas ref={lineChartRef} id="lineChart"></canvas>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>คุณสมบัติ:</strong> กราฟเส้นแบบมาตรฐาน
                    เหมาะสำหรับแสดงแนวโน้มข้อมูลตามเวลา
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-600 mb-3">
                  7.2.3 Multi Axis Line Chart
                </h4>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <canvas ref={multiAxisChartRef} id="multiAxisChart"></canvas>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>คุณสมบัติ:</strong> ใช้หลายแกน Y
                    เพื่อแสดงข้อมูลที่มีหน่วยต่างกัน โดยระบุ{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      yAxisID
                    </code>
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-600 mb-3">
                  7.2.4 Point Styling
                </h4>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <canvas
                    ref={pointStylingChartRef}
                    id="pointStylingChart"
                  ></canvas>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>คุณสมบัติ:</strong> ปรับแต่งจุดข้อมูลด้วย{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      pointStyle
                    </code>
                    ,{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      pointRadius
                    </code>
                    ,{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      pointBackgroundColor
                    </code>
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-600 mb-3">
                  7.2.5 Line Segments
                </h4>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <canvas ref={segmentsChartRef} id="segmentsChart"></canvas>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>คุณสมบัติ:</strong> ใช้{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      segment
                    </code>{" "}
                    property เพื่อกำหนดสไตล์แต่ละช่วงของเส้น
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-600 mb-3">
                  7.2.6 Stepped Line Chart
                </h4>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <canvas ref={steppedChartRef} id="steppedChart"></canvas>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>คุณสมบัติ:</strong> ใช้{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      stepped
                    </code>{" "}
                    property (true, 'before', 'after', 'middle')
                    เพื่อสร้างเส้นแบบขั้นบันได
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-600 mb-3">
                  7.2.7 Line Styling
                </h4>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <canvas ref={stylingChartRef} id="stylingChart"></canvas>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>คุณสมบัติ:</strong> ปรับแต่งเส้นด้วย{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      borderDash
                    </code>
                    ,{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      borderWidth
                    </code>
                    ,{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">fill</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
