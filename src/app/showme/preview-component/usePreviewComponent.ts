import { Chart as ChartJS } from "chart.js";
import { useEffect, useRef, useState } from "react";

export const usePreviewComponent = () => {
  // Calendar states
  const [date, setDate] = useState<Date | null>(null);

  // Dialog state
  const [visible, setVisible] = useState(false);

  // Textarea state
  const [textAreaValue, setTextAreaValue] = useState("");

  // ThaiDatePicker states
  const [selectedDate, setSelectedDate] = useState("2025-12-21");
  const [selectedThaiDate, setSelectedThaiDate] = useState("2568-12-21");

  // Chart refs
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  const floatingChartRef = useRef<HTMLCanvasElement>(null);
  const floatingChartInstanceRef = useRef<ChartJS | null>(null);

  const horizontalChartRef = useRef<HTMLCanvasElement>(null);
  const horizontalChartInstanceRef = useRef<ChartJS | null>(null);

  const stackedChartRef = useRef<HTMLCanvasElement>(null);
  const stackedChartInstanceRef = useRef<ChartJS | null>(null);

  const stackedGroupsChartRef = useRef<HTMLCanvasElement>(null);
  const stackedGroupsChartInstanceRef = useRef<ChartJS | null>(null);

  const verticalChartRef = useRef<HTMLCanvasElement>(null);
  const verticalChartInstanceRef = useRef<ChartJS | null>(null);

  // Line Chart refs
  const interpolationChartRef = useRef<HTMLCanvasElement>(null);
  const interpolationChartInstanceRef = useRef<ChartJS | null>(null);

  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartInstanceRef = useRef<ChartJS | null>(null);

  const multiAxisChartRef = useRef<HTMLCanvasElement>(null);
  const multiAxisChartInstanceRef = useRef<ChartJS | null>(null);

  const pointStylingChartRef = useRef<HTMLCanvasElement>(null);
  const pointStylingChartInstanceRef = useRef<ChartJS | null>(null);

  const segmentsChartRef = useRef<HTMLCanvasElement>(null);
  const segmentsChartInstanceRef = useRef<ChartJS | null>(null);

  const steppedChartRef = useRef<HTMLCanvasElement>(null);
  const steppedChartInstanceRef = useRef<ChartJS | null>(null);

  const stylingChartRef = useRef<HTMLCanvasElement>(null);
  const stylingChartInstanceRef = useRef<ChartJS | null>(null);

  // Other Charts refs
  const bubbleChartRef = useRef<HTMLCanvasElement>(null);
  const bubbleChartInstanceRef = useRef<ChartJS | null>(null);

  const comboChartRef = useRef<HTMLCanvasElement>(null);
  const comboChartInstanceRef = useRef<ChartJS | null>(null);

  const doughnutChartRef = useRef<HTMLCanvasElement>(null);
  const doughnutChartInstanceRef = useRef<ChartJS | null>(null);

  const multiPieChartRef = useRef<HTMLCanvasElement>(null);
  const multiPieChartInstanceRef = useRef<ChartJS | null>(null);

  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartInstanceRef = useRef<ChartJS | null>(null);

  const polarAreaChartRef = useRef<HTMLCanvasElement>(null);
  const polarAreaChartInstanceRef = useRef<ChartJS | null>(null);

  const polarAreaCenterChartRef = useRef<HTMLCanvasElement>(null);
  const polarAreaCenterChartInstanceRef = useRef<ChartJS | null>(null);

  const radarChartRef = useRef<HTMLCanvasElement>(null);
  const radarChartInstanceRef = useRef<ChartJS | null>(null);

  const radarSkipChartRef = useRef<HTMLCanvasElement>(null);
  const radarSkipChartInstanceRef = useRef<ChartJS | null>(null);

  const scatterChartRef = useRef<HTMLCanvasElement>(null);
  const scatterChartInstanceRef = useRef<ChartJS | null>(null);

  const scatterMultiAxisChartRef = useRef<HTMLCanvasElement>(null);
  const scatterMultiAxisChartInstanceRef = useRef<ChartJS | null>(null);

  const stackedBarLineChartRef = useRef<HTMLCanvasElement>(null);
  const stackedBarLineChartInstanceRef = useRef<ChartJS | null>(null);

  // Area Charts refs
  const lineBoundariesChartRef = useRef<HTMLCanvasElement>(null);
  const lineBoundariesChartInstanceRef = useRef<ChartJS | null>(null);

  const lineDatasetsChartRef = useRef<HTMLCanvasElement>(null);
  const lineDatasetsChartInstanceRef = useRef<ChartJS | null>(null);

  const lineDrawtimeChartRef = useRef<HTMLCanvasElement>(null);
  const lineDrawtimeChartInstanceRef = useRef<ChartJS | null>(null);

  const lineStackedChartRef = useRef<HTMLCanvasElement>(null);
  const lineStackedChartInstanceRef = useRef<ChartJS | null>(null);

  const radarStackedChartRef = useRef<HTMLCanvasElement>(null);
  const radarStackedChartInstanceRef = useRef<ChartJS | null>(null);

  // Handlers
  const handleDatePickerChange = (christDate: string, buddhistDate: string) => {
    console.log(christDate);
    console.log(buddhistDate);
    setSelectedDate(christDate);
    setSelectedThaiDate(buddhistDate);
  };

  // Bar Chart with Border Radius
  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    chartInstanceRef.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: [
          "มกราคม",
          "กุมภาพันธ์",
          "มีนาคม",
          "เมษายน",
          "พฤษภาคม",
          "มิถุนายน",
        ],
        datasets: [
          {
            label: "ยอดขาย (พันบาท)",
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: "rgba(34, 197, 94, 0.8)",
            borderColor: "rgba(34, 197, 94, 1)",
            borderWidth: 2,
            borderRadius: 10,
            borderSkipped: false,
          },
          {
            label: "รายได้ (พันบาท)",
            data: [7, 11, 5, 8, 3, 7],
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 2,
            borderRadius: 10,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟแท่งแสดงยอดขายและรายได้ (มุมโค้ง)",
            font: {
              size: 16,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Floating Bars Chart
  useEffect(() => {
    if (!floatingChartRef.current) return;

    if (floatingChartInstanceRef.current) {
      floatingChartInstanceRef.current.destroy();
    }

    const ctx = floatingChartRef.current.getContext("2d");
    if (!ctx) return;

    floatingChartInstanceRef.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: [
          "มกราคม",
          "กุมภาพันธ์",
          "มีนาคม",
          "เมษายน",
          "พฤษภาคม",
          "มิถุนายน",
        ],
        datasets: [
          {
            label: "ช่วงอุณหภูมิ (°C)",
            data: [
              [10, 25],
              [15, 30],
              [8, 22],
              [12, 28],
              [18, 32],
              [20, 35],
            ],
            backgroundColor: "rgba(239, 68, 68, 0.7)",
            borderColor: "rgba(239, 68, 68, 1)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟแท่งลอย - แสดงช่วงอุณหภูมิ",
            font: { size: 16 },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "อุณหภูมิ (°C)",
            },
          },
        },
      },
    });

    return () => {
      if (floatingChartInstanceRef.current) {
        floatingChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Horizontal Bar Chart
  useEffect(() => {
    if (!horizontalChartRef.current) return;

    if (horizontalChartInstanceRef.current) {
      horizontalChartInstanceRef.current.destroy();
    }

    const ctx = horizontalChartRef.current.getContext("2d");
    if (!ctx) return;

    horizontalChartInstanceRef.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: ["สินค้า A", "สินค้า B", "สินค้า C", "สินค้า D", "สินค้า E"],
        datasets: [
          {
            label: "ยอดขาย (หน่วย)",
            data: [65, 59, 80, 81, 56],
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(153, 102, 255, 0.7)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
            ],
            borderWidth: 2,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟแท่งแนวนอน - ยอดขายสินค้า",
            font: { size: 16 },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (horizontalChartInstanceRef.current) {
        horizontalChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Stacked Bar Chart
  useEffect(() => {
    if (!stackedChartRef.current) return;

    if (stackedChartInstanceRef.current) {
      stackedChartInstanceRef.current.destroy();
    }

    const ctx = stackedChartRef.current.getContext("2d");
    if (!ctx) return;

    stackedChartInstanceRef.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม"],
        datasets: [
          {
            label: "สินค้า A",
            data: [12, 19, 3, 5, 2],
            backgroundColor: "rgba(255, 99, 132, 0.7)",
          },
          {
            label: "สินค้า B",
            data: [15, 12, 8, 7, 10],
            backgroundColor: "rgba(54, 162, 235, 0.7)",
          },
          {
            label: "สินค้า C",
            data: [8, 10, 12, 15, 9],
            backgroundColor: "rgba(255, 206, 86, 0.7)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟแท่งซ้อน - ยอดขายรวม",
            font: { size: 16 },
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (stackedChartInstanceRef.current) {
        stackedChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Stacked Bar Chart with Groups
  useEffect(() => {
    if (!stackedGroupsChartRef.current) return;

    if (stackedGroupsChartInstanceRef.current) {
      stackedGroupsChartInstanceRef.current.destroy();
    }

    const ctx = stackedGroupsChartRef.current.getContext("2d");
    if (!ctx) return;

    stackedGroupsChartInstanceRef.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน"],
        datasets: [
          {
            label: "ร้าน A - ออนไลน์",
            data: [10, 15, 12, 18],
            backgroundColor: "rgba(255, 99, 132, 0.7)",
            stack: "Stack 0",
          },
          {
            label: "ร้าน A - หน้าร้าน",
            data: [8, 12, 10, 14],
            backgroundColor: "rgba(255, 159, 164, 0.7)",
            stack: "Stack 0",
          },
          {
            label: "ร้าน B - ออนไลน์",
            data: [12, 18, 14, 20],
            backgroundColor: "rgba(54, 162, 235, 0.7)",
            stack: "Stack 1",
          },
          {
            label: "ร้าน B - หน้าร้าน",
            data: [10, 14, 12, 16],
            backgroundColor: "rgba(154, 208, 245, 0.7)",
            stack: "Stack 1",
          },
        ],
      },
      options: {
        responsive: true,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟแท่งซ้อนแบบกลุ่ม - เปรียบเทียบยอดขายตามช่องทาง",
            font: { size: 16 },
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (stackedGroupsChartInstanceRef.current) {
        stackedGroupsChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Vertical Bar Chart
  useEffect(() => {
    if (!verticalChartRef.current) return;

    if (verticalChartInstanceRef.current) {
      verticalChartInstanceRef.current.destroy();
    }

    const ctx = verticalChartRef.current.getContext("2d");
    if (!ctx) return;

    verticalChartInstanceRef.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: ["2019", "2020", "2021", "2022", "2023", "2024"],
        datasets: [
          {
            label: "รายได้ (ล้านบาท)",
            data: [45, 52, 48, 65, 72, 85],
            backgroundColor: "rgba(34, 197, 94, 0.7)",
            borderColor: "rgba(34, 197, 94, 1)",
            borderWidth: 2,
          },
          {
            label: "ค่าใช้จ่าย (ล้านบาท)",
            data: [30, 35, 32, 42, 48, 55],
            backgroundColor: "rgba(239, 68, 68, 0.7)",
            borderColor: "rgba(239, 68, 68, 1)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟแท่งแนวตั้ง - รายได้และค่าใช้จ่ายรายปี",
            font: { size: 16 },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "จำนวน (ล้านบาท)",
            },
          },
          x: {
            title: {
              display: true,
              text: "ปี",
            },
          },
        },
      },
    });

    return () => {
      if (verticalChartInstanceRef.current) {
        verticalChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Interpolation Modes Line Chart
  useEffect(() => {
    if (!interpolationChartRef.current) return;

    if (interpolationChartInstanceRef.current) {
      interpolationChartInstanceRef.current.destroy();
    }

    const ctx = interpolationChartRef.current.getContext("2d");
    if (!ctx) return;

    const data = [0, 20, 20, 60, 60, 120, null, 180, 120, 125, 105, 110, 170];

    interpolationChartInstanceRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: [
          "ม.ค.",
          "ก.พ.",
          "มี.ค.",
          "เม.ย.",
          "พ.ค.",
          "มิ.ย.",
          "ก.ค.",
          "ส.ค.",
          "ก.ย.",
          "ต.ค.",
          "พ.ย.",
          "ธ.ค.",
        ],
        datasets: [
          {
            label: "Cubic (default)",
            data: data,
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.1)",
            fill: false,
            cubicInterpolationMode: "default",
            tension: 0.4,
          },
          {
            label: "Monotone",
            data: data,
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.1)",
            fill: false,
            cubicInterpolationMode: "monotone",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟเส้นแสดง Interpolation Modes",
            font: { size: 16 },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (interpolationChartInstanceRef.current) {
        interpolationChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Basic Line Chart
  useEffect(() => {
    if (!lineChartRef.current) return;

    if (lineChartInstanceRef.current) {
      lineChartInstanceRef.current.destroy();
    }

    const ctx = lineChartRef.current.getContext("2d");
    if (!ctx) return;

    lineChartInstanceRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค."],
        datasets: [
          {
            label: "ยอดขาย 2023",
            data: [65, 59, 80, 81, 56, 55, 40],
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            tension: 0.1,
          },
          {
            label: "ยอดขาย 2024",
            data: [28, 48, 40, 19, 86, 27, 90],
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟเส้นแสดงยอดขายรายเดือน",
            font: { size: 16 },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (lineChartInstanceRef.current) {
        lineChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Multi Axis Line Chart
  useEffect(() => {
    if (!multiAxisChartRef.current) return;

    if (multiAxisChartInstanceRef.current) {
      multiAxisChartInstanceRef.current.destroy();
    }

    const ctx = multiAxisChartRef.current.getContext("2d");
    if (!ctx) return;

    multiAxisChartInstanceRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."],
        datasets: [
          {
            label: "รายได้ (ล้านบาท)",
            data: [12, 19, 3, 5, 2, 3],
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            yAxisID: "y",
          },
          {
            label: "จำนวนลูกค้า (พัน)",
            data: [1, 5, 2, 8, 3, 7],
            borderColor: "rgb(54, 162, 235)",
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟเส้นแบบ Multi-Axis",
            font: { size: 16 },
          },
        },
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "รายได้ (ล้านบาท)",
            },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "จำนวนลูกค้า (พัน)",
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    });

    return () => {
      if (multiAxisChartInstanceRef.current) {
        multiAxisChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Point Styling Line Chart
  useEffect(() => {
    if (!pointStylingChartRef.current) return;

    if (pointStylingChartInstanceRef.current) {
      pointStylingChartInstanceRef.current.destroy();
    }

    const ctx = pointStylingChartRef.current.getContext("2d");
    if (!ctx) return;

    pointStylingChartInstanceRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."],
        datasets: [
          {
            label: "วงกลม",
            data: [65, 59, 80, 81, 56, 55],
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            pointStyle: "circle",
            pointRadius: 8,
            pointHoverRadius: 12,
          },
          {
            label: "สามเหลี่ยม",
            data: [28, 48, 40, 19, 86, 27],
            borderColor: "rgb(54, 162, 235)",
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            pointStyle: "triangle",
            pointRadius: 8,
            pointHoverRadius: 12,
          },
          {
            label: "สี่เหลี่ยม",
            data: [45, 25, 60, 45, 70, 40],
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            pointStyle: "rect",
            pointRadius: 8,
            pointHoverRadius: 12,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟเส้นแสดง Point Styling",
            font: { size: 16 },
          },
        },
      },
    });

    return () => {
      if (pointStylingChartInstanceRef.current) {
        pointStylingChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Line Segments Chart
  useEffect(() => {
    if (!segmentsChartRef.current) return;

    if (segmentsChartInstanceRef.current) {
      segmentsChartInstanceRef.current.destroy();
    }

    const ctx = segmentsChartRef.current.getContext("2d");
    if (!ctx) return;

    const skipped = (ctx: any, value: any) =>
      ctx.p0.skip || ctx.p1.skip ? value : undefined;
    const down = (ctx: any, value: any) =>
      ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;

    segmentsChartInstanceRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: [
          "ม.ค.",
          "ก.พ.",
          "มี.ค.",
          "เม.ย.",
          "พ.ค.",
          "มิ.ย.",
          "ก.ค.",
          "ส.ค.",
        ],
        datasets: [
          {
            label: "ข้อมูลพร้อม Segments",
            data: [65, 59, null, 81, 56, 55, 40, 70],
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            segment: {
              borderColor: (ctx: any) =>
                skipped(ctx, "rgb(200,200,200)") ||
                down(ctx, "rgb(255,99,132)"),
              borderDash: (ctx: any) => skipped(ctx, [6, 6]),
            },
            spanGaps: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟเส้นแสดง Segments (เส้นสีต่างเมื่อลดลง)",
            font: { size: 16 },
          },
        },
      },
    });

    return () => {
      if (segmentsChartInstanceRef.current) {
        segmentsChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Stepped Line Chart
  useEffect(() => {
    if (!steppedChartRef.current) return;

    if (steppedChartInstanceRef.current) {
      steppedChartInstanceRef.current.destroy();
    }

    const ctx = steppedChartRef.current.getContext("2d");
    if (!ctx) return;

    steppedChartInstanceRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."],
        datasets: [
          {
            label: "Before",
            data: [65, 59, 80, 81, 56, 55],
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            stepped: "before",
          },
          {
            label: "After",
            data: [28, 48, 40, 19, 86, 27],
            borderColor: "rgb(54, 162, 235)",
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            stepped: "after",
          },
          {
            label: "Middle",
            data: [45, 25, 60, 45, 70, 40],
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            stepped: "middle",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟเส้นแบบ Stepped",
            font: { size: 16 },
          },
        },
      },
    });

    return () => {
      if (steppedChartInstanceRef.current) {
        steppedChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Line Styling Chart
  useEffect(() => {
    if (!stylingChartRef.current) return;

    if (stylingChartInstanceRef.current) {
      stylingChartInstanceRef.current.destroy();
    }

    const ctx = stylingChartRef.current.getContext("2d");
    if (!ctx) return;

    stylingChartInstanceRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."],
        datasets: [
          {
            label: "เส้นทึบ + Fill",
            data: [65, 59, 80, 81, 56, 55],
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderWidth: 3,
            fill: true,
          },
          {
            label: "เส้นประ",
            data: [28, 48, 40, 19, 86, 27],
            borderColor: "rgb(54, 162, 235)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderWidth: 2,
            borderDash: [10, 5],
            fill: false,
          },
          {
            label: "เส้นจุด",
            data: [45, 25, 60, 45, 70, 40],
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 2,
            borderDash: [2, 2],
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟเส้นแสดง Line Styling",
            font: { size: 16 },
          },
        },
      },
    });

    return () => {
      if (stylingChartInstanceRef.current) {
        stylingChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Bubble Chart
  useEffect(() => {
    if (!bubbleChartRef.current) return;

    if (bubbleChartInstanceRef.current) {
      bubbleChartInstanceRef.current.destroy();
    }

    const ctx = bubbleChartRef.current.getContext("2d");
    if (!ctx) return;

    bubbleChartInstanceRef.current = new ChartJS(ctx, {
      type: "bubble",
      data: {
        datasets: [
          {
            label: "กลุ่ม A",
            data: [
              { x: 20, y: 30, r: 15 },
              { x: 40, y: 10, r: 10 },
              { x: 30, y: 25, r: 20 },
            ],
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            borderColor: "rgb(255, 99, 132)",
          },
          {
            label: "กลุ่ม B",
            data: [
              { x: 10, y: 20, r: 25 },
              { x: 50, y: 40, r: 15 },
              { x: 25, y: 35, r: 12 },
            ],
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgb(54, 162, 235)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟ Bubble - แสดงความสัมพันธ์ 3 มิติ",
            font: { size: 16 },
          },
        },
      },
    });

    return () => {
      if (bubbleChartInstanceRef.current) {
        bubbleChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Combo Bar/Line Chart
  useEffect(() => {
    if (!comboChartRef.current) return;

    if (comboChartInstanceRef.current) {
      comboChartInstanceRef.current.destroy();
    }

    const ctx = comboChartRef.current.getContext("2d");
    if (!ctx) return;

    comboChartInstanceRef.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."],
        datasets: [
          {
            type: "bar",
            label: "ยอดขาย (พันบาท)",
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            borderColor: "rgb(255, 99, 132)",
          },
          {
            type: "line",
            label: "เป้าหมาย (พันบาท)",
            data: [10, 15, 8, 12, 7, 10],
            borderColor: "rgb(54, 162, 235)",
            backgroundColor: "rgba(54, 162, 235, 0.1)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟผสม Bar/Line - เปรียบเทียบผลกับเป้า",
            font: { size: 16 },
          },
        },
      },
    });

    return () => {
      if (comboChartInstanceRef.current) {
        comboChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Doughnut Chart
  useEffect(() => {
    if (!doughnutChartRef.current) return;

    if (doughnutChartInstanceRef.current) {
      doughnutChartInstanceRef.current.destroy();
    }

    const ctx = doughnutChartRef.current.getContext("2d");
    if (!ctx) return;

    doughnutChartInstanceRef.current = new ChartJS(ctx, {
      type: "doughnut",
      data: {
        labels: ["ออนไลน์", "หน้าร้าน", "โทรศัพท์", "แอปพลิเคชัน"],
        datasets: [
          {
            data: [300, 150, 100, 80],
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
            ],
            borderColor: [
              "rgb(255, 99, 132)",
              "rgb(54, 162, 235)",
              "rgb(255, 206, 86)",
              "rgb(75, 192, 192)",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟวงแหวน - สัดส่วนยอดขายตามช่องทาง",
            font: { size: 16 },
          },
        },
      },
    });

    return () => {
      if (doughnutChartInstanceRef.current) {
        doughnutChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Multi Series Pie Chart
  useEffect(() => {
    if (!multiPieChartRef.current) return;

    if (multiPieChartInstanceRef.current) {
      multiPieChartInstanceRef.current.destroy();
    }

    const ctx = multiPieChartRef.current.getContext("2d");
    if (!ctx) return;

    multiPieChartInstanceRef.current = new ChartJS(ctx, {
      type: "pie",
      data: {
        labels: ["สินค้า A", "สินค้า B", "สินค้า C", "สินค้า D"],
        datasets: [
          {
            label: "Q1",
            data: [300, 50, 100, 80],
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
            ],
          },
          {
            label: "Q2",
            data: [250, 80, 120, 90],
            backgroundColor: [
              "rgba(255, 99, 132, 0.5)",
              "rgba(54, 162, 235, 0.5)",
              "rgba(255, 206, 86, 0.5)",
              "rgba(75, 192, 192, 0.5)",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟวงกลมหลายชุดข้อมูล",
            font: { size: 16 },
          },
        },
      },
    });

    return () => {
      if (multiPieChartInstanceRef.current) {
        multiPieChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Pie Chart
  useEffect(() => {
    if (!pieChartRef.current) return;

    if (pieChartInstanceRef.current) {
      pieChartInstanceRef.current.destroy();
    }

    const ctx = pieChartRef.current.getContext("2d");
    if (!ctx) return;

    pieChartInstanceRef.current = new ChartJS(ctx, {
      type: "pie",
      data: {
        labels: ["ภาคเหนือ", "ภาคกลาง", "ภาคตะวันออกเฉียงเหนือ", "ภาคใต้"],
        datasets: [
          {
            data: [300, 50, 100, 150],
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟวงกลม - สัดส่วนยอดขายตามภูมิภาค",
            font: { size: 16 },
          },
        },
      },
    });

    return () => {
      if (pieChartInstanceRef.current) {
        pieChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Polar Area Chart
  useEffect(() => {
    if (!polarAreaChartRef.current) return;

    if (polarAreaChartInstanceRef.current) {
      polarAreaChartInstanceRef.current.destroy();
    }

    const ctx = polarAreaChartRef.current.getContext("2d");
    if (!ctx) return;

    polarAreaChartInstanceRef.current = new ChartJS(ctx, {
      type: "polarArea",
      data: {
        labels: ["สินค้า A", "สินค้า B", "สินค้า C", "สินค้า D", "สินค้า E"],
        datasets: [
          {
            data: [11, 16, 7, 3, 14],
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(255, 205, 86, 0.7)",
              "rgba(201, 203, 207, 0.7)",
              "rgba(54, 162, 235, 0.7)",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟพื้นที่ขั้วโลก - เปรียบเทียบยอดขาย",
            font: { size: 16 },
          },
        },
      },
    });

    return () => {
      if (polarAreaChartInstanceRef.current) {
        polarAreaChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Polar Area Centered Labels
  useEffect(() => {
    if (!polarAreaCenterChartRef.current) return;

    if (polarAreaCenterChartInstanceRef.current) {
      polarAreaCenterChartInstanceRef.current.destroy();
    }

    const ctx = polarAreaCenterChartRef.current.getContext("2d");
    if (!ctx) return;

    polarAreaCenterChartInstanceRef.current = new ChartJS(ctx, {
      type: "polarArea",
      data: {
        labels: ["Q1", "Q2", "Q3", "Q4"],
        datasets: [
          {
            data: [15, 18, 12, 20],
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟพื้นที่ขั้วโลก - ยอดขายรายไตรมาส",
            font: { size: 16 },
          },
        },
        scales: {
          r: {
            pointLabels: {
              display: true,
              centerPointLabels: true,
              font: {
                size: 14,
              },
            },
          },
        },
      },
    });

    return () => {
      if (polarAreaCenterChartInstanceRef.current) {
        polarAreaCenterChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Radar Chart
  useEffect(() => {
    if (!radarChartRef.current) return;

    if (radarChartInstanceRef.current) {
      radarChartInstanceRef.current.destroy();
    }

    const ctx = radarChartRef.current.getContext("2d");
    if (!ctx) return;

    radarChartInstanceRef.current = new ChartJS(ctx, {
      type: "radar",
      data: {
        labels: ["คุณภาพ", "ราคา", "บริการ", "จัดส่ง", "บรรจุภัณฑ์"],
        datasets: [
          {
            label: "ร้าน A",
            data: [80, 90, 70, 85, 75],
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
          },
          {
            label: "ร้าน B",
            data: [70, 85, 80, 75, 90],
            borderColor: "rgb(54, 162, 235)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟเรดาร์ - เปรียบเทียบคะแนนความพึงพอใจ",
            font: { size: 16 },
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    });

    return () => {
      if (radarChartInstanceRef.current) {
        radarChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Radar Skip Points
  useEffect(() => {
    if (!radarSkipChartRef.current) return;

    if (radarSkipChartInstanceRef.current) {
      radarSkipChartInstanceRef.current.destroy();
    }

    const ctx = radarSkipChartRef.current.getContext("2d");
    if (!ctx) return;

    radarSkipChartInstanceRef.current = new ChartJS(ctx, {
      type: "radar",
      data: {
        labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."],
        datasets: [
          {
            label: "ชุดข้อมูล 1",
            data: [65, 59, null, 81, 56, 55],
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            spanGaps: false,
          },
          {
            label: "ชุดข้อมูล 2",
            data: [28, 48, 40, null, 86, 27],
            borderColor: "rgb(54, 162, 235)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            spanGaps: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟเรดาร์ - ข้ามจุดข้อมูลที่หายไป",
            font: { size: 16 },
          },
        },
      },
    });

    return () => {
      if (radarSkipChartInstanceRef.current) {
        radarSkipChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Scatter Chart
  useEffect(() => {
    if (!scatterChartRef.current) return;

    if (scatterChartInstanceRef.current) {
      scatterChartInstanceRef.current.destroy();
    }

    const ctx = scatterChartRef.current.getContext("2d");
    if (!ctx) return;

    scatterChartInstanceRef.current = new ChartJS(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "ชุดข้อมูล A",
            data: [
              { x: -10, y: 0 },
              { x: 0, y: 10 },
              { x: 10, y: 5 },
              { x: 20, y: 15 },
            ],
            backgroundColor: "rgb(255, 99, 132)",
          },
          {
            label: "ชุดข้อมูล B",
            data: [
              { x: -5, y: 15 },
              { x: 5, y: 5 },
              { x: 15, y: 10 },
              { x: 25, y: 20 },
            ],
            backgroundColor: "rgb(54, 162, 235)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟกระจาย - ความสัมพันธ์ระหว่างตัวแปร",
            font: { size: 16 },
          },
        },
        scales: {
          x: {
            type: "linear",
            position: "bottom",
          },
        },
      },
    });

    return () => {
      if (scatterChartInstanceRef.current) {
        scatterChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Scatter Multi-Axis
  useEffect(() => {
    if (!scatterMultiAxisChartRef.current) return;

    if (scatterMultiAxisChartInstanceRef.current) {
      scatterMultiAxisChartInstanceRef.current.destroy();
    }

    const ctx = scatterMultiAxisChartRef.current.getContext("2d");
    if (!ctx) return;

    scatterMultiAxisChartInstanceRef.current = new ChartJS(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "แกน Y ซ้าย",
            data: [
              { x: 1, y: 5 },
              { x: 2, y: 10 },
              { x: 3, y: 15 },
            ],
            backgroundColor: "rgb(255, 99, 132)",
            yAxisID: "y",
          },
          {
            label: "แกน Y ขวา",
            data: [
              { x: 1, y: 50 },
              { x: 2, y: 100 },
              { x: 3, y: 150 },
            ],
            backgroundColor: "rgb(54, 162, 235)",
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟกระจายแบบหลายแกน",
            font: { size: 16 },
          },
        },
        scales: {
          y: {
            type: "linear",
            position: "left",
          },
          y1: {
            type: "linear",
            position: "right",
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    });

    return () => {
      if (scatterMultiAxisChartInstanceRef.current) {
        scatterMultiAxisChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Stacked Bar/Line Chart
  useEffect(() => {
    if (!stackedBarLineChartRef.current) return;

    if (stackedBarLineChartInstanceRef.current) {
      stackedBarLineChartInstanceRef.current.destroy();
    }

    const ctx = stackedBarLineChartRef.current.getContext("2d");
    if (!ctx) return;

    stackedBarLineChartInstanceRef.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."],
        datasets: [
          {
            type: "bar",
            label: "สินค้า A",
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: "rgba(255, 99, 132, 0.7)",
          },
          {
            type: "bar",
            label: "สินค้า B",
            data: [8, 11, 7, 9, 6, 5],
            backgroundColor: "rgba(54, 162, 235, 0.7)",
          },
          {
            type: "line",
            label: "ผลรวม",
            data: [20, 30, 10, 14, 8, 8],
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.1)",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟผสม Stacked Bar/Line",
            font: { size: 16 },
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      },
    });

    return () => {
      if (stackedBarLineChartInstanceRef.current) {
        stackedBarLineChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Line Chart Boundaries (Area)
  useEffect(() => {
    if (!lineBoundariesChartRef.current) return;

    if (lineBoundariesChartInstanceRef.current) {
      lineBoundariesChartInstanceRef.current.destroy();
    }

    const ctx = lineBoundariesChartRef.current.getContext("2d");
    if (!ctx) return;

    lineBoundariesChartInstanceRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค."],
        datasets: [
          {
            label: "ข้อมูล 1",
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: {
              target: "origin",
              above: "rgba(255, 99, 132, 0.2)",
              below: "rgba(54, 162, 235, 0.2)",
            },
            borderColor: "rgb(255, 99, 132)",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟเส้นแบบ Boundaries - แสดงพื้นที่เหนือ/ใต้เส้น",
            font: { size: 16 },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (lineBoundariesChartInstanceRef.current) {
        lineBoundariesChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Line Chart Datasets (Area)
  useEffect(() => {
    if (!lineDatasetsChartRef.current) return;

    if (lineDatasetsChartInstanceRef.current) {
      lineDatasetsChartInstanceRef.current.destroy();
    }

    const ctx = lineDatasetsChartRef.current.getContext("2d");
    if (!ctx) return;

    lineDatasetsChartInstanceRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."],
        datasets: [
          {
            label: "ชุดข้อมูล 1",
            data: [10, 30, 39, 20, 25, 34],
            fill: true,
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgb(255, 99, 132)",
          },
          {
            label: "ชุดข้อมูล 2",
            data: [18, 33, 22, 19, 11, 39],
            fill: true,
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgb(54, 162, 235)",
          },
          {
            label: "ชุดข้อมูล 3",
            data: [28, 12, 20, 31, 25, 27],
            fill: true,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgb(75, 192, 192)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟเส้นหลายชุดข้อมูล - แสดงพื้นที่ทับซ้อน",
            font: { size: 16 },
          },
        },
        interaction: {
          mode: "index",
          intersect: false,
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (lineDatasetsChartInstanceRef.current) {
        lineDatasetsChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Line Chart DrawTime (Area)
  useEffect(() => {
    if (!lineDrawtimeChartRef.current) return;

    if (lineDrawtimeChartInstanceRef.current) {
      lineDrawtimeChartInstanceRef.current.destroy();
    }

    const ctx = lineDrawtimeChartRef.current.getContext("2d");
    if (!ctx) return;

    lineDrawtimeChartInstanceRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."],
        datasets: [
          {
            label: "Before Dataset Draw",
            data: [20, 35, 40, 30, 45, 40],
            fill: "origin",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgb(255, 99, 132)",
          },
          {
            label: "Before Draw",
            data: [35, 25, 30, 35, 40, 35],
            fill: "origin",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgb(54, 162, 235)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟเส้นแบบ DrawTime - ควบคุมการวาดพื้นที่",
            font: { size: 16 },
          },
          filler: {
            propagate: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (lineDrawtimeChartInstanceRef.current) {
        lineDrawtimeChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Line Chart Stacked (Area)
  useEffect(() => {
    if (!lineStackedChartRef.current) return;

    if (lineStackedChartInstanceRef.current) {
      lineStackedChartInstanceRef.current.destroy();
    }

    const ctx = lineStackedChartRef.current.getContext("2d");
    if (!ctx) return;

    lineStackedChartInstanceRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."],
        datasets: [
          {
            label: "สินค้า A",
            data: [33, 25, 35, 51, 54, 76],
            fill: true,
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            borderColor: "rgb(255, 99, 132)",
          },
          {
            label: "สินค้า B",
            data: [33, 25, 35, 51, 54, 76].map(v => v + 20),
            fill: true,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgb(54, 162, 235)",
          },
          {
            label: "สินค้า C",
            data: [33, 25, 35, 51, 54, 76].map(v => v + 40),
            fill: true,
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderColor: "rgb(75, 192, 192)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟเส้นซ้อน - แสดงผลรวมสะสม",
            font: { size: 16 },
          },
        },
        scales: {
          y: {
            stacked: true,
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (lineStackedChartInstanceRef.current) {
        lineStackedChartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Radar Chart Stacked (Area)
  useEffect(() => {
    if (!radarStackedChartRef.current) return;

    if (radarStackedChartInstanceRef.current) {
      radarStackedChartInstanceRef.current.destroy();
    }

    const ctx = radarStackedChartRef.current.getContext("2d");
    if (!ctx) return;

    radarStackedChartInstanceRef.current = new ChartJS(ctx, {
      type: "radar",
      data: {
        labels: ["ความเร็ว", "ความแข็งแรง", "ความทนทาน", "ความแม่นยำ", "เทคนิค"],
        datasets: [
          {
            label: "นักกีฬา A",
            data: [80, 90, 70, 85, 75],
            fill: true,
            backgroundColor: "rgba(255, 99, 132, 0.4)",
            borderColor: "rgb(255, 99, 132)",
          },
          {
            label: "นักกีฬา B",
            data: [70, 85, 80, 75, 90],
            fill: true,
            backgroundColor: "rgba(54, 162, 235, 0.4)",
            borderColor: "rgb(54, 162, 235)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "กราฟเรดาร์แบบ Area - เปรียบเทียบความสามารถ",
            font: { size: 16 },
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    });

    return () => {
      if (radarStackedChartInstanceRef.current) {
        radarStackedChartInstanceRef.current.destroy();
      }
    };
  }, []);

  return {
    // Calendar
    date,
    setDate,

    // Dialog
    visible,
    setVisible,

    // Textarea
    textAreaValue,
    setTextAreaValue,

    // ThaiDatePicker
    selectedDate,
    selectedThaiDate,
    handleDatePickerChange,

    // Chart refs
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
    bubbleChartRef,
    comboChartRef,
    doughnutChartRef,
    multiPieChartRef,
    pieChartRef,
    polarAreaChartRef,
    polarAreaCenterChartRef,
    radarChartRef,
    radarSkipChartRef,
    scatterChartRef,
    scatterMultiAxisChartRef,
    stackedBarLineChartRef,
    lineBoundariesChartRef,
    lineDatasetsChartRef,
    lineDrawtimeChartRef,
    lineStackedChartRef,
    radarStackedChartRef,
  };
};
