"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Inspection {
  inspectionId: number;
  inspectionNo: number;
  inspectionDateAndTime: string;
  inspectionTypeId: number;
  inspectionStatus: string;
  inspectionResult: string;
  auditorChiefId: number;
  rubberFarmId: number;
  inspectionType?: {
    typeName: string;
  };
  rubberFarm?: {
    villageName: string;
    district: string;
    province: string;
    farmer?: {
      namePrefix: string;
      firstName: string;
      lastName: string;
    };
  };
}

interface InspectionItem {
  inspectionItemId: number;
  inspectionId: number;
  inspectionItemMasterId: number;
  inspectionItemNo: number;
  inspectionItemResult: string;
  otherConditions: any;
  inspectionItemMaster?: {
    itemNo: number;
    itemName: string;
  };
  requirements?: Requirement[];
}

interface Requirement {
  requirementId: number;
  requirementNo: number;
  evaluationResult: string;
  evaluationMethod: string;
  note: string;
  requirementMaster?: {
    requirementName: string;
    requirementLevel: string;
    requirementLevelNo: string;
  };
}

interface RubberFarmDetails {
  rubberFarmId: number;
  villageName: string;
  moo: number;
  road: string;
  alley: string;
  subDistrict: string;
  district: string;
  province: string;
  location: any;
  plantingDetails: PlantingDetail[];
}

interface PlantingDetail {
  plantingDetailId: number;
  specie: string;
  areaOfPlot: number;
  numberOfRubber: number;
  numberOfTapping: number;
  ageOfRubber: number;
  yearOfTapping: string;
  monthOfTapping: string;
  totalProduction: number;
}

export default function AuditorInspectionsPage() {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] =
    useState<Inspection | null>(null);
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFarmDetails, setShowFarmDetails] = useState(false);
  const [selectedFarmDetails, setSelectedFarmDetails] =
    useState<RubberFarmDetails | null>(null);
  const [loadingFarmDetails, setLoadingFarmDetails] = useState(false);

  // State for sidebar
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Add state for search and pagination
  const [inspectionSearchTerm, setInspectionSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Auditor info
  const [auditor, setAuditor] = useState({
    namePrefix: "",
    firstName: "",
    lastName: "",
    isLoading: true,
  });

  // Navigation menu items
  const navItems = [
    {
      title: "หน้าหลัก",
      href: "/auditor/dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      title: "ตรวจประเมินสวนยางพารา",
      href: "/auditor/inspections",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75a2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
          />
        </svg>
      ),
    },
    {
      title: "แจ้งกำหนดการวันที่ตรวจประเมิน",
      href: "/auditor/applications",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
          />
        </svg>
      ),
    },
    {
      title: "สรุปผลการตรวจประเมิน",
      href: "/auditor/reports",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      ),
    },
    {
      title: "บันทึกข้อมูลประจำสวนยาง",
      href: "/auditor/garden-data",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V7.875c0-.621-.504-1.125-1.125-1.125H12a9.06 9.06 0 00-1.5.124"
          />
        </svg>
      ),
    },
    {
      title: "บันทึกการให้คำปรึกษาและข้อบกพร่อง",
      href: "/auditor/consultations",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
      ),
    },
  ];

  // ดึงรายการตรวจประเมินที่รอดำเนินการ
  useEffect(() => {
    fetchPendingInspections();

    // Fetch auditor data
    const fetchAuditorData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch("/api/v1/auditors/current", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const auditorData = await response.json();
            setAuditor({
              namePrefix: auditorData.namePrefix || "",
              firstName: auditorData.firstName || "",
              lastName: auditorData.lastName || "",
              isLoading: false,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching auditor data:", error);
        setAuditor({
          namePrefix: "",
          firstName: "ไม่ทราบชื่อ",
          lastName: "",
          isLoading: false,
        });
      }
    };

    fetchAuditorData();

    // Check screen size
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarVisible(false);
        setSidebarCollapsed(true);
      } else {
        setSidebarVisible(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleSidebarVisibility = () => {
    setSidebarVisible(!sidebarVisible);
    if (!sidebarVisible) {
      setDropdownOpen(false);
    }
  };

  const handleNavClick = () => {
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const fetchPendingInspections = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // 1. ดึงข้อมูล Auditor ที่กำลัง login
      const auditorResponse = await fetch("/api/v1/auditors/current", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!auditorResponse.ok) {
        throw new Error("ไม่สามารถดึงข้อมูล Auditor ได้");
      }

      const auditorData = await auditorResponse.json();
      const auditorId = auditorData.auditorId;

      // 2. ดึงรายการตรวจประเมินทั้งหมด
      const inspectionsResponse = await fetch("/api/v1/inspections", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!inspectionsResponse.ok) {
        throw new Error("ไม่สามารถดึงรายการตรวจประเมินได้");
      }

      const allInspections = await inspectionsResponse.json();

      // 3. ดึงรายการ AuditorInspection ที่เกี่ยวข้องกับ Auditor คนนี้
      const auditorInspectionsResponse = await fetch(
        `/api/v1/auditor-inspections?auditorId=${auditorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!auditorInspectionsResponse.ok) {
        throw new Error("ไม่สามารถดึงรายการตรวจประเมินที่มอบหมายได้");
      }

      const auditorInspections = await auditorInspectionsResponse.json();

      // ดึงเฉพาะ inspectionId ที่มอบหมายให้เป็นผู้ตรวจประเมินในทีม
      const teamInspectionIds = auditorInspections.map(
        (ai: { inspectionId: number }) => ai.inspectionId
      );

      // 4. กรองรายการตรวจประเมินที่เกี่ยวข้องกับ Auditor คนนี้
      // ทั้งกรณีเป็นหัวหน้าผู้ตรวจ (auditorChiefId) และเป็นผู้ตรวจในทีม (AuditorInspection)
      const assignedInspections = allInspections.filter(
        (inspection: Inspection) =>
          (inspection.auditorChiefId === auditorId || // เป็นหัวหน้าผู้ตรวจ
            teamInspectionIds.includes(inspection.inspectionId)) && // เป็นผู้ตรวจในทีม
          inspection.inspectionStatus === "รอการตรวจประเมิน"
      );

      setInspections(assignedInspections);
    } catch (error) {
      console.error("Error fetching assigned inspections:", error);
      toast.error("ไม่สามารถดึงข้อมูลรายการตรวจประเมินที่มอบหมายได้");
      setInspections([]);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับแสดง dialog ให้เลือกตำแหน่งเริ่มตรวจประเมิน
  const showStartPositionDialog = (incompleteIndex: number) => {
    return new Promise<number>((resolve) => {
      // สร้าง dialog element
      const dialogOverlay = document.createElement("div");
      dialogOverlay.className =
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

      const dialogContent = document.createElement("div");
      dialogContent.className =
        "bg-white rounded-lg p-6 max-w-md w-full shadow-xl";
      dialogContent.innerHTML = `
      <h3 class="text-lg font-semibold text-gray-900 mb-4">เลือกตำแหน่งเริ่มตรวจประเมิน</h3>
      <p class="text-sm text-gray-600 mb-6">พบรายการตรวจที่ยังไม่สมบูรณ์ คุณต้องการเริ่มตรวจจากจุดใด?</p>
      <div class="flex justify-end space-x-4">
        <button id="start-first" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">เริ่มจากรายการแรก</button>
        <button id="start-incomplete" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">เริ่มจากรายการที่ ${
          incompleteIndex + 1
        }</button>
      </div>
    `;

      dialogOverlay.appendChild(dialogContent);
      document.body.appendChild(dialogOverlay);

      // เพิ่ม event listeners
      document.getElementById("start-first")?.addEventListener("click", () => {
        document.body.removeChild(dialogOverlay);
        resolve(0);
      });

      document
        .getElementById("start-incomplete")
        ?.addEventListener("click", () => {
          document.body.removeChild(dialogOverlay);
          resolve(incompleteIndex);
        });
    });
  };

  // ดึงรายการตรวจของ inspection ที่เลือก
  const fetchInspectionItems = async (inspectionId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/v1/inspection-items?inspectionId=${inspectionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched inspection items:", data);

        // แก้ไขการเรียงลำดับใหม่
        const sortedData = [...data].sort((a, b) => {
          // ดึงเลขหัวข้อ (เช่น "1.1", "1.2") จากชื่อหรือ itemNo
          const aItemNo = String(a.inspectionItemMaster?.itemNo || "");
          const bItemNo = String(b.inspectionItemMaster?.itemNo || "");

          // ถ้ามีรูปแบบ x.y (เช่น 1.1, 1.2, 2.1)
          const aMatch = aItemNo.match(/^(\d+)\.(\d+)$/);
          const bMatch = bItemNo.match(/^(\d+)\.(\d+)$/);

          if (aMatch && bMatch) {
            // เรียงตามตัวเลขหลักแรกก่อน (เช่น "1" ในเลข "1.1")
            const aMajor = parseInt(aMatch[1]);
            const bMajor = parseInt(bMatch[1]);
            if (aMajor !== bMajor) return aMajor - bMajor;

            // จากนั้นเรียงตามตัวเลขหลักที่สอง (เช่น "1" ในเลข "1.1")
            const aMinor = parseInt(aMatch[2]);
            const bMinor = parseInt(bMatch[2]);
            return aMinor - bMinor;
          }

          // หากรูปแบบไม่ตรงกับ x.y ให้ใช้การเรียงแบบเดิม
          return a.inspectionItemNo - b.inspectionItemNo;
        });

        // เรียงรายการ requirements ภายในแต่ละ item ด้วย
        sortedData.forEach((item) => {
          if (item.requirements && item.requirements.length > 0) {
            item.requirements.sort((a: Requirement, b: Requirement) => {
              // เรียงตาม requirementNo ถ้าเป็นตัวเลข
              const aNum = parseInt(String(a.requirementNo));
              const bNum = parseInt(String(b.requirementNo));

              if (!isNaN(aNum) && !isNaN(bNum)) {
                return aNum - bNum;
              }

              // ถ้าไม่ใช่ตัวเลขให้เรียงตามข้อความ
              return String(a.requirementNo).localeCompare(
                String(b.requirementNo)
              );
            });
          }
        });

        setInspectionItems(sortedData);

        // หากมีรายการที่บันทึกไว้ในคุกกี้ ให้ใช้รายการนั้น
        const savedPosition = localStorage.getItem(
          `inspectionPosition-${inspectionId}`
        );
        if (savedPosition) {
          const position = parseInt(savedPosition, 10);
          // ตรวจสอบว่าตำแหน่งที่บันทึกไว้อยู่ในช่วงถูกต้องหรือไม่
          if (position >= 0 && position < sortedData.length) {
            // แสดงข้อความแจ้งเตือนว่ากำลังดำเนินการต่อจากครั้งที่แล้ว
            alert(`กำลังดำเนินการต่อจากรายการตรวจที่ ${position + 1}`);
            setCurrentItemIndex(position);
            return;
          }
        }

        // กรณีไม่มีตำแหน่งที่บันทึกไว้ หรือตำแหน่งไม่ถูกต้อง
        // ค้นหารายการแรกที่ยังไม่สมบูรณ์
        let incompleteIndex = 0;
        for (let i = 0; i < sortedData.length; i++) {
          const item = sortedData[i];

          // ตรวจสอบว่ารายการนี้สมบูรณ์หรือไม่
          const isComplete =
            item.inspectionItemResult === "ผ่าน" ||
            item.inspectionItemResult === "ไม่ผ่าน";

          // ตรวจสอบว่า requirements ทั้งหมดสมบูรณ์หรือไม่
          const allRequirementsComplete = item.requirements
            ? item.requirements.every(
                (req: Requirement) =>
                  req.evaluationResult &&
                  req.evaluationResult !== "NOT_EVALUATED" &&
                  req.evaluationMethod &&
                  req.evaluationMethod !== "PENDING"
              )
            : true;

          // ถ้าพบรายการที่ไม่สมบูรณ์
          if (!isComplete || !allRequirementsComplete) {
            incompleteIndex = i;

            // ถ้าเป็นรายการแรกที่ไม่สมบูรณ์ ให้เริ่มที่รายการนั้นเลย
            setCurrentItemIndex(incompleteIndex);
            return;
          }
        }

        // ถ้าทุกรายการสมบูรณ์หมดแล้ว ให้เริ่มที่รายการแรก
        setCurrentItemIndex(0);
      }
    } catch (error) {
      console.error("Error fetching inspection items:", error);
      setCurrentItemIndex(0);
    }
  };

  // บันทึกตำแหน่งปัจจุบันเมื่อเปลี่ยนรายการหรือบันทึกข้อมูล
  const saveCurrentPosition = () => {
    if (selectedInspection) {
      localStorage.setItem(
        `inspectionPosition-${selectedInspection.inspectionId}`,
        currentItemIndex.toString()
      );
    }
  };

  // ดึงข้อมูล farm details
  const fetchFarmDetails = async (farmId: number) => {
    setLoadingFarmDetails(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/v1/rubber-farms/${farmId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedFarmDetails(data);
        setShowFarmDetails(true);
      }
    } catch (error) {
      console.error("Error fetching farm details:", error);
      alert("ไม่สามารถดึงข้อมูลสวนยางได้");
    } finally {
      setLoadingFarmDetails(false);
    }
  };

  // Filter inspections based on search term
  const filteredInspections = inspections.filter((inspection) => {
    const inspectionNo =
      inspection.inspectionNo?.toString().toLowerCase() || "";
    const farmerName = inspection.rubberFarm?.farmer
      ? `${inspection.rubberFarm.farmer.namePrefix}${inspection.rubberFarm.farmer.firstName} ${inspection.rubberFarm.farmer.lastName}`.toLowerCase()
      : "";
    const location = [
      inspection.rubberFarm?.villageName || "",
      inspection.rubberFarm?.district || "",
      inspection.rubberFarm?.province || "",
    ]
      .join(" ")
      .toLowerCase();
    const date = new Date(inspection.inspectionDateAndTime)
      .toLocaleDateString("th-TH")
      .toLowerCase();
    const typeName = inspection.inspectionType?.typeName?.toLowerCase() || "";

    const searchLower = inspectionSearchTerm.toLowerCase();

    return (
      inspectionNo.includes(searchLower) ||
      farmerName.includes(searchLower) ||
      location.includes(searchLower) ||
      date.includes(searchLower) ||
      typeName.includes(searchLower)
    );
  });

  // Pagination logic
  const indexOfLastInspection = currentPage * itemsPerPage;
  const indexOfFirstInspection = indexOfLastInspection - itemsPerPage;
  const currentInspections = filteredInspections.slice(
    indexOfFirstInspection,
    indexOfLastInspection
  );
  const totalPages = Math.ceil(filteredInspections.length / itemsPerPage);

  // เลือก inspection เพื่อเริ่มตรวจ
  const selectInspection = async (inspection: Inspection) => {
    setSelectedInspection(inspection);
    await fetchInspectionItems(inspection.inspectionId);
    // ไม่กำหนด setCurrentItemIndex(0) อีกต่อไป เพราะจะให้ fetchInspectionItems กำหนดแทน
  };

  // ตรวจสอบความสมบูรณ์ของข้อมูล
  const validateCurrentItem = (): boolean => {
    const item = inspectionItems[currentItemIndex];
    if (!item || !item.requirements) return false;

    // ตรวจสอบว่าทุก requirement มีผลการประเมิน
    for (const req of item.requirements) {
      if (!req.evaluationResult || req.evaluationResult === "NOT_EVALUATED") {
        alert("กรุณาเลือกผลการตรวจประเมินให้ครบทุกข้อกำหนด");
        return false;
      }

      if (!req.evaluationMethod || req.evaluationMethod === "PENDING") {
        alert("กรุณาเลือกวิธีการตรวจประเมินให้ครบทุกข้อกำหนด");
        return false;
      }
    }

    return true;
  };

  // อัปเดตผลการประเมินข้อกำหนด
  const updateRequirementEvaluation = (
    itemIndex: number,
    requirementIndex: number,
    field: string,
    value: string
  ) => {
    const updatedItems = [...inspectionItems];
    const item = updatedItems[itemIndex];

    if (item.requirements && item.requirements[requirementIndex]) {
      // Debug: แสดงการอัพเดท
      console.log(
        `Updating requirement ${requirementIndex} - ${field}: ${value}`
      );

      // สร้าง object ใหม่เพื่อให้ React detect การเปลี่ยนแปลง
      item.requirements[requirementIndex] = {
        ...item.requirements[requirementIndex],
        [field]: value,
      };

      // อัพเดท state
      setInspectionItems(updatedItems);

      // Debug: ตรวจสอบหลังอัพเดท
      console.log("Updated requirements:", item.requirements);
    } else {
      console.error(`Cannot find requirement at index ${requirementIndex}`);
    }
  };

  // อัปเดตข้อมูลเพิ่มเติม
  const updateOtherConditions = (
    itemIndex: number,
    field: string,
    value: string
  ) => {
    const updatedItems = [...inspectionItems];
    updatedItems[itemIndex].otherConditions = {
      ...updatedItems[itemIndex].otherConditions,
      [field]: value,
    };
    setInspectionItems(updatedItems);
  };

  // ฟังก์ชันสำหรับแสดงข้อมูลเพิ่มเติมตามประเภทรายการตรวจ
  const renderAdditionalFields = (itemIndex: number) => {
    const item = inspectionItems[itemIndex];
    const itemName = item?.inspectionItemMaster?.itemName || "";

    switch (itemName) {
      case "น้ำ":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              ข้อมูลเพิ่มเติม
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  แหล่งน้ำที่ใช้ในแปลงปลูก
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="เช่น น้ำฝน, น้ำบาดาล, คลองชลประทาน"
                  value={item?.otherConditions?.waterSource || ""}
                  onChange={(e) =>
                    updateOtherConditions(
                      itemIndex,
                      "waterSource",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  น้ำที่ใช้ในกระบวนการหลังการเก็บเกี่ยว
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="ระบุแหล่งน้ำที่ใช้ในกระบวนการหลังการเก็บเกี่ยว"
                  value={item?.otherConditions?.postHarvestWaterSource || ""}
                  onChange={(e) =>
                    updateOtherConditions(
                      itemIndex,
                      "postHarvestWaterSource",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        );

      case "พื้นที่ปลูก":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              ข้อมูลเพิ่มเติม
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สภาพพื้นที่ปลูก
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center">
                  <input
                    id="terrain-flat"
                    type="radio"
                    name="terrain-type"
                    value="ที่ราบ"
                    checked={item?.otherConditions?.topography === "ที่ราบ"}
                    onChange={(e) =>
                      updateOtherConditions(
                        itemIndex,
                        "topography",
                        e.target.value
                      )
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <label
                    htmlFor="terrain-flat"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    2.1 ที่ราบ
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="terrain-lowland"
                    type="radio"
                    name="terrain-type"
                    value="ที่ราบลุ่ม"
                    checked={item?.otherConditions?.topography === "ที่ราบลุ่ม"}
                    onChange={(e) =>
                      updateOtherConditions(
                        itemIndex,
                        "topography",
                        e.target.value
                      )
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <label
                    htmlFor="terrain-lowland"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    2.2 ที่ราบลุ่ม
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="terrain-upland"
                    type="radio"
                    name="terrain-type"
                    value="ที่ดอน"
                    checked={item?.otherConditions?.topography === "ที่ดอน"}
                    onChange={(e) =>
                      updateOtherConditions(
                        itemIndex,
                        "topography",
                        e.target.value
                      )
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <label
                    htmlFor="terrain-upland"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    2.3 ที่ดอน
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="terrain-ridges"
                    type="radio"
                    name="terrain-type"
                    value="ยกร่อง"
                    checked={item?.otherConditions?.topography === "ยกร่อง"}
                    onChange={(e) =>
                      updateOtherConditions(
                        itemIndex,
                        "topography",
                        e.target.value
                      )
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <label
                    htmlFor="terrain-ridges"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    2.4 ยกร่อง
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="terrain-ridges-water"
                    type="radio"
                    name="terrain-type"
                    value="ยกร่องน้ำขึ้นถึง"
                    checked={
                      item?.otherConditions?.topography === "ยกร่องน้ำขึ้นถึง"
                    }
                    onChange={(e) =>
                      updateOtherConditions(
                        itemIndex,
                        "topography",
                        e.target.value
                      )
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <label
                    htmlFor="terrain-ridges-water"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    2.5 ยกร่องน้ำขึ้งถึง
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="terrain-other"
                    type="radio"
                    name="terrain-type"
                    value="อื่นๆ"
                    checked={
                      item?.otherConditions?.topography === "อื่นๆ" ||
                      (item?.otherConditions?.topography &&
                        ![
                          "ที่ราบ",
                          "ที่ราบลุ่ม",
                          "ที่ดอน",
                          "ยกร่อง",
                          "ยกร่องน้ำขึ้นถึง",
                        ].includes(item?.otherConditions?.topography))
                    }
                    onChange={(e) =>
                      updateOtherConditions(
                        itemIndex,
                        "topography",
                        e.target.value
                      )
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <label
                    htmlFor="terrain-other"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    2.6 อื่น ๆ ระบุ...
                  </label>
                </div>
              </div>

              {item?.otherConditions?.topography === "อื่นๆ" && (
                <div className="mt-3">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="ระบุสภาพพื้นที่ปลูกอื่นๆ"
                    value={item?.otherConditions?.topographyOther || ""}
                    onChange={(e) =>
                      updateOtherConditions(
                        itemIndex,
                        "topographyOther",
                        e.target.value
                      )
                    }
                  />
                </div>
              )}
            </div>
          </div>

          //   <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          //   <h3 className="text-md font-semibold text-gray-800 mb-3">
          //     ข้อมูลเพิ่มเติม
          //   </h3>
          //   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          //     <div>
          //       <label className="block text-sm font-medium text-gray-700 mb-1">
          //         ลักษณะภูมิประเทศ
          //       </label>
          //       <select
          //         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          //         value={item?.otherConditions?.topography || ""}
          //         onChange={(e) =>
          //           updateOtherConditions(
          //             itemIndex,
          //             "topography",
          //             e.target.value
          //           )
          //         }
          //       >
          //         <option value="">เลือกลักษณะภูมิประเทศ</option>
          //         <option value="พื้นที่ราบ">พื้นที่ราบ</option>
          //         <option value="พื้นที่ลาดชัน">พื้นที่ลาดชัน</option>
          //         <option value="พื้นที่ที่ราบสูง">พื้นที่ที่ราบสูง</option>
          //       </select>
          //     </div>
          //     <div>
          //       <label className="block text-sm font-medium text-gray-700 mb-1">
          //         ประวัติการใช้ที่ดิน
          //       </label>
          //       <textarea
          //         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          //         rows={2}
          //         placeholder="ระบุประวัติการใช้ที่ดินย้อนหลัง 2 ปี"
          //         value={item?.otherConditions?.landHistory || ""}
          //         onChange={(e) =>
          //           updateOtherConditions(
          //             itemIndex,
          //             "landHistory",
          //             e.target.value
          //           )
          //         }
          //       />
          //     </div>
          //   </div>
          // </div>
        );

      case "วัตถุอันตรายทางการเกษตร":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              ข้อมูลเพิ่มเติม
            </h3>
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  id="no-hazardous-materials"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  checked={
                    item?.otherConditions?.noHazardousMaterials === "true"
                  }
                  onChange={(e) =>
                    updateOtherConditions(
                      itemIndex,
                      "noHazardousMaterials",
                      e.target.checked ? "true" : "false"
                    )
                  }
                />
                <label
                  htmlFor="no-hazardous-materials"
                  className="ml-2 block text-sm text-gray-900"
                >
                  ไม่ได้ใช้วัตถุอันตรายทางการเกษตรในการผลิต
                </label>
              </div>
            </div>
          </div>
        );

      // case "การจัดการคุณภาพในกระบวนการผลิตก่อนการเปิดกรีด":
      // case "การจัดการคุณภาพในกระบวนการผลิตหลังการเปิดกรีด":
      //   return (
      //     <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      //       <h3 className="text-md font-semibold text-gray-800 mb-3">
      //         ข้อมูลเพิ่มเติม
      //       </h3>
      //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      //         <div>
      //           <label className="block text-sm font-medium text-gray-700 mb-1">
      //             พันธุ์ยางที่ปลูก
      //           </label>
      //           <input
      //             type="text"
      //             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
      //             placeholder="ระบุพันธุ์ยาง"
      //             value={item?.otherConditions?.rubberVariety || ""}
      //             onChange={(e) =>
      //               updateOtherConditions(
      //                 itemIndex,
      //                 "rubberVariety",
      //                 e.target.value
      //               )
      //             }
      //           />
      //         </div>
      //         <div>
      //           <label className="block text-sm font-medium text-gray-700 mb-1">
      //             การจัดการปุ๋ย
      //           </label>
      //           <textarea
      //             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
      //             rows={2}
      //             placeholder="ระบุชนิดและปริมาณปุ๋ยที่ใช้"
      //             value={item?.otherConditions?.fertilizerManagement || ""}
      //             onChange={(e) =>
      //               updateOtherConditions(
      //                 itemIndex,
      //                 "fertilizerManagement",
      //                 e.target.value
      //               )
      //             }
      //           />
      //         </div>
      //       </div>
      //     </div>
      //   );

      // case "การเก็บเกี่ยวและการปฏิบัติหลังการเก็บเกี่ยว สำหรับผลิตน้ำยางสด":
      // case "การผลิตวัตถุดิบคุณภาพดีและการขนส่งสำหรับผลิตน้ำยางสด":
      //   return (
      //     <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      //       <h3 className="text-md font-semibold text-gray-800 mb-3">
      //         ข้อมูลเพิ่มเติม - การผลิตน้ำยางสด
      //       </h3>
      //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      //         <div>
      //           <label className="block text-sm font-medium text-gray-700 mb-1">
      //             เวลาเริ่มกรีด
      //           </label>
      //           <input
      //             type="time"
      //             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
      //             value={item?.otherConditions?.tappingStartTime || ""}
      //             onChange={(e) =>
      //               updateOtherConditions(
      //                 itemIndex,
      //                 "tappingStartTime",
      //                 e.target.value
      //               )
      //             }
      //           />
      //         </div>
      //         <div>
      //           <label className="block text-sm font-medium text-gray-700 mb-1">
      //             เวลาเก็บน้ำยาง
      //           </label>
      //           <input
      //             type="time"
      //             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
      //             value={item?.otherConditions?.collectionTime || ""}
      //             onChange={(e) =>
      //               updateOtherConditions(
      //                 itemIndex,
      //                 "collectionTime",
      //                 e.target.value
      //               )
      //             }
      //           />
      //         </div>
      //       </div>
      //     </div>
      //   );

      // case "การเก็บเกี่ยวและการปฏิบัติหลังการเก็บเกี่ยว สำหรับผลิตยางก้อนถ้วย":
      // case "การผลิตวัตถุดิบคุณภาพดีและการขนส่งสำหรับผลิตยางก้อนถ้วย":
      //   return (
      //     <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      //       <h3 className="text-md font-semibold text-gray-800 mb-3">
      //         ข้อมูลเพิ่มเติม - การผลิตยางก้อนถ้วย
      //       </h3>
      //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      //         <div>
      //           <label className="block text-sm font-medium text-gray-700 mb-1">
      //             ความเข้มข้นกรดฟอร์มิค (%)
      //           </label>
      //           <select
      //             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
      //             value={item?.otherConditions?.acidConcentration || ""}
      //             onChange={(e) =>
      //               updateOtherConditions(
      //                 itemIndex,
      //                 "acidConcentration",
      //                 e.target.value
      //               )
      //             }
      //           >
      //             <option value="">เลือกความเข้มข้น</option>
      //             <option value="3">3%</option>
      //             <option value="4">4%</option>
      //             <option value="5">5%</option>
      //           </select>
      //         </div>
      //         <div>
      //           <label className="block text-sm font-medium text-gray-700 mb-1">
      //             จำนวนมีดกรีด
      //           </label>
      //           <input
      //             type="number"
      //             min="1"
      //             max="6"
      //             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
      //             placeholder="ไม่เกิน 6 มีด"
      //             value={item?.otherConditions?.numberOfTaps || ""}
      //             onChange={(e) =>
      //               updateOtherConditions(
      //                 itemIndex,
      //                 "numberOfTaps",
      //                 e.target.value
      //               )
      //             }
      //           />
      //         </div>
      //       </div>
      //     </div>
      //   );

      // case "สุขลักษณะส่วนบุคคล":
      //   return (
      //     <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      //       <h3 className="text-md font-semibold text-gray-800 mb-3">
      //         ข้อมูลเพิ่มเติม
      //       </h3>
      //       <div className="space-y-3">
      //         <div>
      //           <label className="block text-sm font-medium text-gray-700 mb-1">
      //             อุปกรณ์ป้องกันส่วนบุคคลที่มี
      //           </label>
      //           <textarea
      //             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
      //             rows={2}
      //             placeholder="ระบุอุปกรณ์ป้องกันที่มี เช่น หน้ากาก ถุงมือ รองเท้า"
      //             value={item?.otherConditions?.ppe || ""}
      //             onChange={(e) =>
      //               updateOtherConditions(itemIndex, "ppe", e.target.value)
      //             }
      //           />
      //         </div>
      //       </div>
      //     </div>
      //   );

      // case "การบันทึกและการจัดเก็บข้อมูล":
      //   return (
      //     <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      //       <h3 className="text-md font-semibold text-gray-800 mb-3">
      //         ข้อมูลเพิ่มเติม
      //       </h3>
      //       <div className="space-y-3">
      //         <div>
      //           <label className="block text-sm font-medium text-gray-700 mb-1">
      //             ระบบการบันทึกข้อมูลที่ใช้
      //           </label>
      //           <select
      //             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
      //             value={item?.otherConditions?.recordSystem || ""}
      //             onChange={(e) =>
      //               updateOtherConditions(
      //                 itemIndex,
      //                 "recordSystem",
      //                 e.target.value
      //               )
      //             }
      //           >
      //             <option value="">เลือกระบบการบันทึก</option>
      //             <option value="สมุดบันทึก">สมุดบันทึก</option>
      //             <option value="คอมพิวเตอร์">คอมพิวเตอร์</option>
      //             <option value="ระบบออนไลน์">ระบบออนไลน์</option>
      //           </select>
      //         </div>
      //       </div>
      //     </div>
      //   );

      default:
        return null;
    }
  };

  // บันทึกผลการตรวจรายการปัจจุบัน
  // Add an options parameter to control alert and navigation behavior
  const saveCurrentItem = async (options?: {
    showAlert?: boolean;
    skipNavigation?: boolean;
  }) => {
    if (!validateCurrentItem()) return false;
    if (!selectedInspection || !inspectionItems[currentItemIndex]) return false;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const currentItem = inspectionItems[currentItemIndex];

      // Debug: ตรวจสอบข้อมูล requirements ก่อนส่ง
      console.log("Current item requirements:", currentItem.requirements);
      console.log(
        "Total requirements to save:",
        currentItem.requirements?.length || 0
      );

      // อัปเดต inspection item
      const itemResponse = await fetch(
        `/api/v1/inspection-items/${currentItem.inspectionItemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            inspectionItemResult: determineItemResult(currentItem),
            otherConditions: currentItem.otherConditions || {},
          }),
        }
      );

      if (!itemResponse.ok) {
        const errorData = await itemResponse.json();
        throw new Error(errorData.message || "Failed to save inspection item");
      }

      const updatedItems = [...inspectionItems];
      updatedItems[currentItemIndex] = {
        ...updatedItems[currentItemIndex],
        inspectionItemResult: determineItemResult(currentItem),
      };

      // อัปเดต requirements แบบ Promise.all เพื่อให้แน่ใจว่าทุกตัวถูกบันทึก
      if (currentItem.requirements && currentItem.requirements.length > 0) {
        const requirementPromises = currentItem.requirements.map(
          async (requirement, index) => {
            // Debug: แสดงข้อมูลแต่ละ requirement
            console.log(`Saving requirement ${index + 1}:`, {
              requirementId: requirement.requirementId,
              evaluationResult: requirement.evaluationResult,
              evaluationMethod: requirement.evaluationMethod,
              note: requirement.note,
            });

            // ข้ามถ้ายังไม่ได้ประเมิน
            if (
              !requirement.evaluationResult ||
              requirement.evaluationResult === "NOT_EVALUATED"
            ) {
              console.log(
                `Skipping requirement ${requirement.requirementId} - not evaluated`
              );
              return null;
            }

            try {
              const reqResponse = await fetch(
                `/api/v1/requirements/${requirement.requirementId}/evaluation`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    evaluationResult: requirement.evaluationResult,
                    evaluationMethod: requirement.evaluationMethod || "PENDING",
                    note: requirement.note || "",
                  }),
                }
              );

              if (!reqResponse.ok) {
                const errorData = await reqResponse.json();
                console.error(
                  `Failed to save requirement ${requirement.requirementId}:`,
                  errorData
                );
                throw new Error(
                  `Failed to save requirement ${requirement.requirementId}: ${errorData.message}`
                );
              }

              const savedData = await reqResponse.json();
              console.log(
                `Successfully saved requirement ${requirement.requirementId}:`,
                savedData
              );
              return savedData;
            } catch (error) {
              console.error(
                `Error saving requirement ${requirement.requirementId}:`,
                error
              );
              throw error;
            }
          }
        );

        // รอให้ทุก requirement ถูกบันทึก
        const results = await Promise.all(requirementPromises);
        const successCount = results.filter((r) => r !== null).length;
        console.log(`Successfully saved ${successCount} requirements`);

        if (successCount === 0) {
          throw new Error("ไม่สามารถบันทึกข้อกำหนดได้เลย");
        }
      }

      setInspectionItems(updatedItems);

      saveCurrentPosition();

      // แสดงข้อความแจ้งเตือนเฉพาะเมื่อเรียกใช้โดยไม่ใช่จากฟังก์ชัน completeInspection
      if (!options || options.showAlert !== false) {
        alert("บันทึกผลการตรวจรายการนี้เรียบร้อยแล้ว");
      }

      // ไปรายการถัดไป (เฉพาะกรณีที่ไม่ได้เรียกจาก completeInspection)
      if (
        (!options || !options.skipNavigation) &&
        currentItemIndex < inspectionItems.length - 1
      ) {
        setCurrentItemIndex(currentItemIndex + 1);
      }

      return true;
    } catch (error) {
      console.error("Error saving inspection item:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก: " + (error as Error).message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // กำหนดผลการตรวจของรายการตรวจ
  const determineItemResult = (item: InspectionItem): string => {
    if (!item.requirements || item.requirements.length === 0) {
      return "ผ่าน";
    }

    const mainRequirements = item.requirements.filter(
      (req) => req.requirementMaster?.requirementLevel === "ข้อกำหนดหลัก"
    );

    const hasFailedMain = mainRequirements.some(
      (req) => req.evaluationResult === "ไม่ใช่"
    );

    return hasFailedMain ? "ไม่ผ่าน" : "ผ่าน";
  };

  // ฟังก์ชันสำหรับตรวจสอบว่าตรวจประเมินครบทุกรายการหรือยัง
  const checkAllItemsCompleted = () => {
    // ตรวจสอบว่ามีรายการตรวจหรือไม่
    if (!inspectionItems || inspectionItems.length === 0) {
      return false;
    }

    // ตรวจสอบแต่ละรายการว่าได้ประเมินแล้วหรือไม่
    for (const item of inspectionItems) {
      // ตรวจสอบว่ารายการนี้มีผลการประเมินหรือไม่
      if (!item.inspectionItemResult || item.inspectionItemResult === "") {
        return false;
      }

      // ตรวจสอบว่า requirements ทั้งหมดได้รับการประเมินหรือไม่
      if (item.requirements && item.requirements.length > 0) {
        for (const req of item.requirements) {
          if (
            !req.evaluationResult ||
            req.evaluationResult === "NOT_EVALUATED" ||
            !req.evaluationMethod ||
            req.evaluationMethod === "PENDING"
          ) {
            return false;
          }
        }
      }
    }

    return true;
  };

  // จบการตรวจประเมิน
  const completeInspection = async () => {
    if (!selectedInspection) return;

    // ตรวจสอบความครบถ้วนของการตรวจประเมิน
    if (!checkAllItemsCompleted()) {
      toast.error(
        "ไม่สามารถจบการตรวจประเมินได้ เนื่องจากยังมีรายการที่ยังไม่ได้ตรวจประเมิน",
        { duration: 5000 }
      );
      return;
    }

    try {
      // บันทึกข้อมูลของรายการสุดท้ายก่อน โดยไม่แสดง alert และไม่ให้เปลี่ยนรายการ
      const saveSuccess = await saveCurrentItem({
        showAlert: false,
        skipNavigation: true,
      });

      // ถ้าบันทึกไม่สำเร็จ ให้หยุดการทำงาน
      if (!saveSuccess) {
        toast.error("ไม่สามารถบันทึกข้อมูลรายการสุดท้ายได้");
        return;
      }

      const token = localStorage.getItem("token");

      // ทำการอัพเดตสถานะการตรวจประเมิน
      const response = await fetch(
        `/api/v1/inspections/${selectedInspection.inspectionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            inspectionStatus: "ตรวจประเมินแล้ว",
            inspectionResult: "รอผลการตรวจประเมิน",
          }),
        }
      );

      if (response.ok) {
        toast.success(
          "การตรวจประเมินเสร็จสิ้น กรุณาไปที่หน้าสรุปผลเพื่อพิจารณาผลการประเมิน",
          { duration: 5000 }
        );

        router.push(
          `/auditor/inspection-summary/${selectedInspection.inspectionId}`
        );
      } else {
        toast.error("ไม่สามารถอัปเดตสถานะการตรวจประเมินได้");
      }
    } catch (error) {
      console.error("Error completing inspection:", error);
      toast.error("เกิดข้อผิดพลาดในการจบการตรวจประเมิน");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      {/* Mobile Overlay */}
      {isMobile && sidebarVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebarVisibility}
        ></div>
      )}

      {/* Sidebar */}
      {sidebarVisible && (
        <div
          className={`bg-white shadow-md transition-all duration-300 h-screen fixed z-30 ${
            sidebarCollapsed ? "w-14" : "w-64"
          } ${isMobile ? "left-0" : ""} flex flex-col`}
        >
          {/* Toggle button */}
          <div className="p-3 flex justify-end border-b border-gray-200">
            <button
              onClick={
                isMobile ? toggleSidebarVisibility : toggleSidebarCollapse
              }
              className="p-1 rounded-md hover:bg-gray-100"
            >
              {isMobile ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4">
            <ul className="space-y-6">
              {navItems.map((item, index) => {
                const isActive = item.href === "/auditor/inspections";
                return (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className={`flex items-center ${
                        sidebarCollapsed ? "justify-center px-3" : "px-4"
                      } py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors ${
                        isActive
                          ? "bg-green-50 border-l-4 border-green-500 text-green-700"
                          : ""
                      }`}
                      onClick={handleNavClick}
                    >
                      <div
                        className={
                          isActive ? "text-green-600" : "text-gray-500"
                        }
                      >
                        {item.icon}
                      </div>
                      {!sidebarCollapsed && (
                        <span className="ml-3 text-sm font-medium">
                          {item.title}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    {auditor.firstName.charAt(0)}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {auditor.namePrefix}
                    {auditor.firstName} {auditor.lastName}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col ${
          sidebarVisible && !isMobile
            ? sidebarCollapsed
              ? "ml-14"
              : "ml-64"
            : "ml-0"
        } transition-all duration-300`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={toggleSidebarVisibility}
                  className="mr-2 p-1 rounded-md hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              )}
              <Link href="/auditor/dashboard">
                <Image
                  src="/logo_header.png"
                  alt="Rubber Authority of Thailand Logo"
                  width={180}
                  height={180}
                  className="mr-2 w-[120px] sm:w-[140px] md:w-[180px]"
                />
              </Link>
            </div>

            <div className="flex items-center">
              <div className="relative">
                <button
                  className="flex items-center space-x-3 focus:outline-none"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {auditor.isLoading ? (
                      <div className="animate-pulse h-5 w-24 bg-gray-200 rounded"></div>
                    ) : (
                      <>
                        {auditor.namePrefix}
                        {auditor.firstName} {auditor.lastName}
                      </>
                    )}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    {!auditor.isLoading && auditor.firstName.charAt(0)}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <Link
                      href="/auditor/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ข้อมูลโปรไฟล์
                    </Link>
                    <Link
                      href="/auditor/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ตั้งค่า
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!selectedInspection ? (
            // แสดงรายการตรวจประเมินที่รอดำเนินการ
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                รายการตรวจประเมินที่รอดำเนินการ
              </h1>

              {inspections.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-500 mb-4">
                    ไม่พบรายการตรวจประเมินที่รอดำเนินการ
                  </p>
                  <Link
                    href="/auditor/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    กลับสู่หน้าหลัก
                  </Link>
                </div>
              ) : (
                <>
                  {/* Search Bar */}
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="ค้นหาการตรวจประเมิน (รหัสการตรวจ, พื้นที่, เกษตรกร, วันที่, ประเภทการตรวจ)..."
                      value={inspectionSearchTerm}
                      onChange={(e) => {
                        setInspectionSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page on new search
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="hidden md:block w-full overflow-auto bg-white rounded-lg shadow">
                    <div className="min-w-full overflow-hidden overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                            >
                              รหัสการตรวจ
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                            >
                              วันที่นัดหมาย
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                            >
                              ประเภทการตรวจ
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                            >
                              พื้นที่
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                            >
                              เกษตรกร
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                            >
                              การดำเนินการ
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {loading ? (
                            <tr>
                              <td colSpan={6} className="text-center py-4">
                                <div className="flex justify-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                                </div>
                              </td>
                            </tr>
                          ) : currentInspections.length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="text-center py-4 text-gray-500"
                              >
                                ไม่พบข้อมูลที่ตรงกับการค้นหา
                              </td>
                            </tr>
                          ) : (
                            currentInspections.map((inspection) => (
                              <tr key={inspection.inspectionId}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {inspection.inspectionNo}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(
                                    inspection.inspectionDateAndTime
                                  ).toLocaleDateString("th-TH", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {inspection.inspectionType?.typeName || "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {inspection.rubberFarm?.villageName || "-"},{" "}
                                  {inspection.rubberFarm?.district || "-"},{" "}
                                  {inspection.rubberFarm?.province || "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {inspection.rubberFarm?.farmer
                                    ? `${inspection.rubberFarm.farmer.namePrefix}${inspection.rubberFarm.farmer.firstName} ${inspection.rubberFarm.farmer.lastName}`
                                    : "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <div className="flex justify-center space-x-2">
                                    <button
                                      onClick={() => {
                                        if (inspection.rubberFarmId) {
                                          fetchFarmDetails(
                                            inspection.rubberFarmId
                                          );
                                        }
                                      }}
                                      className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
                                    >
                                      ดูข้อมูล
                                    </button>
                                    <button
                                      onClick={() =>
                                        selectInspection(inspection)
                                      }
                                      className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm"
                                    >
                                      เริ่มตรวจประเมิน
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="md:hidden space-y-4">
                    {currentInspections.length === 0 ? (
                      <div className="bg-white rounded-lg p-4 text-center text-gray-500">
                        ไม่พบข้อมูลที่ตรงกับการค้นหา
                      </div>
                    ) : (
                      currentInspections.map((inspection) => (
                        <div
                          key={inspection.inspectionId}
                          className="bg-white rounded-lg shadow p-4"
                        >
                          <div className="mb-3">
                            <h3 className="font-semibold text-gray-900">
                              เลขที่: {inspection.inspectionNo}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {inspection.inspectionType?.typeName || "N/A"}
                            </p>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">
                                เกษตรกร:{" "}
                              </span>
                              {inspection.rubberFarm?.farmer ? (
                                <span>
                                  {inspection.rubberFarm.farmer.namePrefix}
                                  {inspection.rubberFarm.farmer.firstName}{" "}
                                  {inspection.rubberFarm.farmer.lastName}
                                </span>
                              ) : (
                                "N/A"
                              )}
                            </div>

                            <div>
                              <span className="font-medium text-gray-700">
                                สถานที่:{" "}
                              </span>
                              {inspection.rubberFarm
                                ? `${inspection.rubberFarm.villageName}, ${inspection.rubberFarm.district}`
                                : "N/A"}
                            </div>

                            <div>
                              <span className="font-medium text-gray-700">
                                วันที่:{" "}
                              </span>
                              {new Date(
                                inspection.inspectionDateAndTime
                              ).toLocaleDateString("th-TH")}
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() =>
                                fetchFarmDetails(inspection.rubberFarmId)
                              }
                              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                              disabled={loadingFarmDetails}
                            >
                              ดูข้อมูล
                            </button>
                            <button
                              onClick={() => selectInspection(inspection)}
                              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                            >
                              เริ่มตรวจ
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-sm text-gray-700">
                        แสดง {indexOfFirstInspection + 1} ถึง{" "}
                        {Math.min(
                          indexOfLastInspection,
                          filteredInspections.length
                        )}{" "}
                        จาก {filteredInspections.length} รายการ
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border rounded-md disabled:opacity-50"
                        >
                          ก่อนหน้า
                        </button>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 border rounded-md disabled:opacity-50"
                        >
                          ถัดไป
                        </button>
                      </div>
                    </div>
                  )}

                  {showFarmDetails && selectedFarmDetails && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-gray-900">
                            ข้อมูลสวนยางพารา
                          </h3>
                          <button
                            onClick={() => setShowFarmDetails(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto">
                          {/* ข้อมูลที่ตั้งสวน */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-2">
                              ที่ตั้งสวนยาง
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">
                                  หมู่บ้าน:
                                </span>{" "}
                                {selectedFarmDetails.villageName}
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">
                                  หมู่ที่:
                                </span>{" "}
                                {selectedFarmDetails.moo}
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">
                                  ถนน:
                                </span>{" "}
                                {selectedFarmDetails.road || "-"}
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">
                                  ซอย:
                                </span>{" "}
                                {selectedFarmDetails.alley || "-"}
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">
                                  ตำบล:
                                </span>{" "}
                                {selectedFarmDetails.subDistrict}
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">
                                  อำเภอ:
                                </span>{" "}
                                {selectedFarmDetails.district}
                              </div>
                              <div className="md:col-span-2">
                                <span className="font-medium text-gray-600">
                                  จังหวัด:
                                </span>{" "}
                                {selectedFarmDetails.province}
                              </div>
                            </div>
                          </div>

                          {/* ข้อมูลแปลงปลูก */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-2">
                              รายละเอียดแปลงปลูก
                            </h4>
                            {selectedFarmDetails.plantingDetails &&
                            selectedFarmDetails.plantingDetails.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        พันธุ์ยาง
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        พื้นที่ (ไร่)
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        จำนวนต้น
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        จำนวนต้นที่กรีด
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        อายุ (ปี)
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        ผลผลิต (กก.)
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {selectedFarmDetails.plantingDetails.map(
                                      (detail, index) => (
                                        <tr key={index}>
                                          <td className="px-3 py-2 text-sm text-gray-900">
                                            {detail.specie}
                                          </td>
                                          <td className="px-3 py-2 text-sm text-gray-900">
                                            {detail.areaOfPlot}
                                          </td>
                                          <td className="px-3 py-2 text-sm text-gray-900">
                                            {detail.numberOfRubber}
                                          </td>
                                          <td className="px-3 py-2 text-sm text-gray-900">
                                            {detail.numberOfTapping}
                                          </td>
                                          <td className="px-3 py-2 text-sm text-gray-900">
                                            {detail.ageOfRubber}
                                          </td>
                                          <td className="px-3 py-2 text-sm text-gray-900">
                                            {detail.totalProduction}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                ไม่มีข้อมูลแปลงปลูก
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => setShowFarmDetails(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                          >
                            ปิด
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            // แสดงฟอร์มการตรวจประเมิน
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">
                    ตรวจประเมินสวนยางพารา
                  </h1>
                  <button
                    onClick={() => setSelectedInspection(null)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 17l-5-5m0 0l5-5m-5 5h12"
                      />
                    </svg>
                    กลับไปหน้ารายการตรวจ
                  </button>
                </div>
                <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    <div>
                      <h2 className="text-sm font-medium text-gray-500">
                        รหัสการตรวจประเมิน
                      </h2>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {selectedInspection.inspectionNo}
                      </p>
                    </div>
                    <div>
                      <h2 className="text-sm font-medium text-gray-500">
                        วันที่นัดหมาย
                      </h2>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {new Date(
                          selectedInspection.inspectionDateAndTime
                        ).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <h2 className="text-sm font-medium text-gray-500">
                        ประเภทการตรวจ
                      </h2>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {selectedInspection.inspectionType?.typeName || "-"}
                      </p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <h2 className="text-sm font-medium text-gray-500">
                        พื้นที่สวนยาง
                      </h2>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {selectedInspection.rubberFarm?.villageName || "-"},{" "}
                        {selectedInspection.rubberFarm?.district || "-"},{" "}
                        {selectedInspection.rubberFarm?.province || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {inspectionItems.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      รายการตรวจที่ {currentItemIndex + 1} จาก{" "}
                      {inspectionItems.length} :{" "}
                      {inspectionItems[currentItemIndex]?.inspectionItemMaster
                        ?.itemName || ""}
                    </h2>
                    {/* เพิ่มปุ่มสำหรับรีเซ็ตตำแหน่ง */}
                    <button
                      onClick={() => {
                        if (
                          selectedInspection &&
                          confirm("ต้องการเริ่มต้นจากรายการแรกใหม่หรือไม่?")
                        ) {
                          localStorage.removeItem(
                            `inspectionPosition-${selectedInspection.inspectionId}`
                          );
                          setCurrentItemIndex(0);
                          alert("เริ่มต้นจากรายการแรกเรียบร้อยแล้ว");
                        }
                      }}
                      className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                      เริ่มใหม่
                    </button>
                    <div className="mt-3 relative">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-600 h-2.5 rounded-full"
                          style={{
                            width: `${
                              ((currentItemIndex + 1) /
                                inspectionItems.length) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>

                      {/* แสดงสถานะรายการตรวจ */}
                      <div className="flex mt-2 overflow-x-auto py-1">
                        {inspectionItems.map((item, index) => (
                          <div
                            key={item.inspectionItemId}
                            className={`flex-shrink-0 px-2 py-1 mx-1 rounded-md text-xs font-medium cursor-pointer
                ${
                  index === currentItemIndex
                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                    : item.inspectionItemResult === "ผ่าน"
                    ? "bg-green-100 text-green-800"
                    : item.inspectionItemResult === "ไม่ผ่าน"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
                            onClick={() => {
                              // ถามผู้ใช้ก่อนเปลี่ยนหน้า ถ้ากำลังแก้ไขรายการปัจจุบันอยู่
                              if (index !== currentItemIndex) {
                                if (
                                  window.confirm(
                                    "ต้องการเปลี่ยนไปรายการตรวจอื่นหรือไม่? ข้อมูลที่ยังไม่ได้บันทึกจะหายไป"
                                  )
                                ) {
                                  setCurrentItemIndex(index);
                                }
                              }
                            }}
                          >
                            {index + 1}{" "}
                            {item.inspectionItemResult === "ผ่าน"
                              ? "✓"
                              : item.inspectionItemResult === "ไม่ผ่าน"
                              ? "✗"
                              : ""}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {/* {inspectionItems[currentItemIndex]?.inspectionItemMaster
                        ?.itemNo || ""}{" "} */}
                      {inspectionItems[currentItemIndex]?.inspectionItemMaster
                        ?.itemName || ""}
                    </h3>
                  </div>

                  {/* Requirements section */}
                  {inspectionItems[currentItemIndex] &&
                  inspectionItems[currentItemIndex].requirements &&
                  inspectionItems[currentItemIndex].requirements.length > 0 ? (
                    <div className="mb-6 space-y-4">
                      {inspectionItems[currentItemIndex].requirements?.map(
                        (requirement, requirementIndex) => (
                          <div
                            key={requirement.requirementId}
                            className="p-4 border rounded-md bg-gray-50"
                          >
                            <div className="mb-2">
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      requirement.requirementMaster
                                        ?.requirementLevel === "ข้อกำหนดหลัก"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {requirement.requirementMaster
                                      ?.requirementLevel || ""}
                                    {requirement.requirementMaster
                                      ?.requirementLevelNo
                                      ? ` ${requirement.requirementMaster.requirementLevelNo}`
                                      : ""}
                                  </span>
                                </div>
                                <h4 className="ml-2 text-md font-medium text-gray-900">
                                  {requirement.requirementNo}.{" "}
                                  {requirement.requirementMaster
                                    ?.requirementName || ""}
                                </h4>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              {/* ผลการตรวจประเมิน */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  ผลการตรวจประเมิน
                                </label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                                  value={requirement.evaluationResult || ""}
                                  onChange={(e) =>
                                    updateRequirementEvaluation(
                                      currentItemIndex,
                                      requirementIndex,
                                      "evaluationResult",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="NOT_EVALUATED">
                                    -- เลือกผลการตรวจ --
                                  </option>
                                  <option value="ใช่">ใช่ (ผ่าน)</option>
                                  <option value="ไม่ใช่">
                                    ไม่ใช่ (ไม่ผ่าน)
                                  </option>
                                  <option value="NA">ไม่เกี่ยวข้อง (NA)</option>
                                </select>
                              </div>

                              {/* วิธีการตรวจประเมิน */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  วิธีการตรวจประเมิน
                                </label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                                  value={requirement.evaluationMethod || ""}
                                  onChange={(e) =>
                                    updateRequirementEvaluation(
                                      currentItemIndex,
                                      requirementIndex,
                                      "evaluationMethod",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="PENDING">
                                    -- เลือกวิธีการตรวจ --
                                  </option>
                                  <option value="พินิจ">พินิจ</option>
                                  <option value="สัมภาษณ์">สัมภาษณ์</option>
                                </select>
                              </div>

                              {/* บันทึกเพิ่มเติม */}
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  บันทึกเพิ่มเติม (ถ้ามี)
                                </label>
                                <textarea
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                                  rows={3}
                                  value={requirement.note || ""}
                                  onChange={(e) =>
                                    updateRequirementEvaluation(
                                      currentItemIndex,
                                      requirementIndex,
                                      "note",
                                      e.target.value
                                    )
                                  }
                                  placeholder="บันทึกข้อมูลเพิ่มเติมเกี่ยวกับการตรวจประเมินข้อนี้"
                                ></textarea>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      ไม่พบข้อกำหนดสำหรับรายการตรวจนี้
                    </p>
                  )}

                  {/* Additional fields section */}
                  {renderAdditionalFields(currentItemIndex)}

                  {/* Navigation buttons */}
                  <div className="flex justify-between items-center mt-8">
                    <button
                      onClick={() => {
                        if (currentItemIndex > 0) {
                          setCurrentItemIndex(currentItemIndex - 1);
                        }
                      }}
                      disabled={currentItemIndex === 0}
                      className={`px-4 py-2 rounded-md font-medium ${
                        currentItemIndex === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                          />
                        </svg>
                        ย้อนกลับ
                      </span>
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => saveCurrentItem()}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            กำลังบันทึก...
                          </span>
                        ) : (
                          "บันทึก"
                        )}
                      </button>
                      {currentItemIndex < inspectionItems.length - 1 ? (
                        <button
                          onClick={() => {
                            if (validateCurrentItem()) {
                              saveCurrentItem();
                            }
                          }}
                          disabled={saving}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          ถัดไป
                          <svg
                            className="w-5 h-5 ml-2 inline-block"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={completeInspection}
                          disabled={!checkAllItemsCompleted()}
                          className={`px-4 py-2 ${
                            checkAllItemsCompleted()
                              ? "bg-purple-600 hover:bg-purple-700"
                              : "bg-gray-400 cursor-not-allowed"
                          } text-white rounded-md font-medium`}
                          title={
                            checkAllItemsCompleted()
                              ? ""
                              : "ต้องตรวจประเมินให้ครบทุกรายการก่อน"
                          }
                        >
                          {checkAllItemsCompleted()
                            ? "จบการตรวจประเมิน"
                            : "รอการประเมินให้ครบถ้วน"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white py-6 border-t mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Rubber Authority of Thailand Logo"
                  width={40}
                  height={40}
                  className="mr-2"
                />
                <p className="text-sm text-gray-500">
                  © {new Date().getFullYear()} การยางแห่งประเทศไทย.
                  สงวนลิขสิทธิ์.
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex space-x-6">
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    นโยบายความเป็นส่วนตัว
                  </a>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    เงื่อนไขการใช้งาน
                  </a>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    ติดต่อเรา
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
