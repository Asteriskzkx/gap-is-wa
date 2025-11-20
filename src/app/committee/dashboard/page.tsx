"use client";

// Layout
import CommitteeLayout from "@/components/layout/CommitteeLayout";

// Components
import CommitteeActionCard from "@/components/committee/CommitteeActionCard";
import CommitteeStatusCard from "@/components/committee/CommitteeStatusCard";

// Icons
import {
  AssignmentIcon,
  CancelIcon,
  CheckCircleIcon,
  EditIcon,
  HomeIcon,
  StacksIcon,
  TextClipboardIcon,
} from "@/components/icons";
import { useEffect, useState } from "react";

interface CommitteeSummary {
  pendingAssessments: number;
  issuedCertifications: number;
  revocationRequests: number;
}

export default function CommitteeDashboardPage() {
  // Summary state
  const [summary, setSummary] = useState<CommitteeSummary>({
    pendingAssessments: 0,
    issuedCertifications: 0,
    revocationRequests: 0,
  });

  // Navigation menu items for dashboard content
  const navItems = [
    {
      title: "หน้าหลัก",
      href: "/committee/dashboard",
      icon: <HomeIcon className="h-6 w-6" />,
    },
    {
      title: "พิจารณาผลการตรวจประเมิน",
      href: "/committee/assessments",
      icon: <TextClipboardIcon className="h-6 w-6" />,
    },
    {
      title: "ใบรับรองแหล่งผลิตจีเอพีในระบบ",
      href: "/committee/certifications/list",
      icon: <StacksIcon className="h-6 w-6" />,
    },
    {
      title: "ออกใบรับรองแหล่งผลิตจีเอพี",
      href: "/committee/certifications/issue",
      icon: <EditIcon className="h-6 w-6" />,
    },
    {
      title: "ยกเลิกใบรับรองแหล่งผลิตจีเอพี",
      href: "/committee/certifications/revoke",
      icon: <CancelIcon className="h-6 w-6" />,
    },
  ];

  const processSummaryData = async () => {
    try {
      // Fetch counts in parallel (use small limit to get paginator.total)
      const readyUrl = `/api/v1/inspections/ready-to-issue?limit=1&offset=0`;

      const issuedUrl = `/api/v1/certificates/already-issue?activeFlag=true&limit=1&offset=0`;

      const revokeUrl = `/api/v1/certificates/revoke-list?activeFlag=true&cancelRequestFlag=true&limit=1&offset=0`;

      const [readyRes, issuedRes, revokeRes] = await Promise.all([
        fetch(readyUrl),
        fetch(issuedUrl),
        fetch(revokeUrl),
      ]);

      const readyJson = readyRes.ok ? await readyRes.json() : null;
      const issuedJson = issuedRes.ok ? await issuedRes.json() : null;
      const revokeJson = revokeRes.ok ? await revokeRes.json() : null;

      const pendingAssessments =
        readyJson?.paginator?.total ??
        (Array.isArray(readyJson?.results) ? readyJson.results.length : 0);

      const issuedCertifications =
        issuedJson?.paginator?.total ??
        (Array.isArray(issuedJson?.results) ? issuedJson.results.length : 0);

      const revocationRequests =
        revokeJson?.paginator?.total ??
        (Array.isArray(revokeJson?.results) ? revokeJson.results.length : 0);

      setSummary({
        pendingAssessments,
        issuedCertifications,
        revocationRequests,
      });
    } catch (error) {
      console.error("processSummaryData error:", error);
      setSummary({
        pendingAssessments: 0,
        issuedCertifications: 0,
        revocationRequests: 0,
      });
    }
  };

  useEffect(() => {
    processSummaryData();
  }, []);

  return (
    <CommitteeLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            หน้าหลักคณะกรรมการ
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            ยินดีต้อนรับสู่ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
          </p>
        </div>

        {/* Action Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {navItems
            .filter((item) => item.title !== "หน้าหลัก") // กรองการ์ดที่ไม่ต้องการแสดง
            .map((item, index) => {
              let colorClass = "bg-blue-100 text-blue-600";
              let description = "ดูรายงานสรุปข้อมูลต่างๆ";

              if (index === 0) {
                colorClass = "bg-indigo-100 text-indigo-600";
                description =
                  "พิจารณาผลการตรวจประเมินสวนยางพาราจากผู้ตรวจประเมิน";
              } else if (index === 1) {
                colorClass = "bg-amber-100 text-amber-600";
                description = "ใบรับรองแหล่งผลิตยางพาราที่อยู่ในระบบทั้งหมด";
              } else if (index === 2) {
                colorClass = "bg-emerald-100 text-emerald-600";
                description =
                  "ออกใบรับรองแหล่งผลิตยางพาราที่ผ่านการตรวจประเมิน";
              } else if (index === 3) {
                colorClass = "bg-red-100 text-red-600";
                description = "ยกเลิกใบรับรองแหล่งผลิตยางพารา";
              }

              return (
                <CommitteeActionCard
                  key={item.href}
                  title={item.title}
                  description={description}
                  href={item.href}
                  icon={item.icon}
                  colorClass={colorClass}
                />
              );
            })}
        </div>

        {/* Pending Certification Requests */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            คำขอรับรองที่รอการพิจารณา
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CommitteeStatusCard
              title="รายการที่รอการพิจารณา"
              count={summary.pendingAssessments}
              icon={
                <AssignmentIcon className="h-6 w-6 text-indigo-500 mr-3 mt-0.5" />
              }
              bgColor="bg-indigo-50"
              borderColor="border-indigo-100"
              textColor="text-indigo-700"
              linkHref="/committee/certifications/issue"
              linkText="ดูรายการ"
              linkTextColor="text-indigo-600"
            />

            <CommitteeStatusCard
              title="ใบรับรองที่ออกแล้ว"
              count={summary.issuedCertifications}
              icon={
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
              }
              bgColor="bg-emerald-50"
              borderColor="border-emerald-100"
              textColor="text-emerald-700"
              linkHref="/committee/certifications/list"
              linkText="ดูรายการ"
              linkTextColor="text-emerald-600"
            />

            <CommitteeStatusCard
              title="ใบรับรองที่มีคำขอยกเลิก"
              count={summary.revocationRequests}
              icon={<CancelIcon className="h-6 w-6 text-red-500 mr-3 mt-0.5" />}
              bgColor="bg-red-50"
              borderColor="border-red-100"
              textColor="text-red-700"
              linkHref="/committee/certifications/revoke"
              linkText="ดูรายการ"
              linkTextColor="text-red-600"
            />
          </div>
        </div>
      </div>
    </CommitteeLayout>
  );
}
