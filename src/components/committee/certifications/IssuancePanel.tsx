"use client";

import React, { useEffect, useState } from "react";
import { StepIndicator } from "@/components/farmer/StepIndicator";
import PrimaryCalendar from "@/components/ui/PrimaryCalendar";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryUpload from "@/components/ui/PrimaryUpload";

interface Props {
  inspection: any;
  onIssued: () => void;
  onBack?: () => void;
  showStepIndicator?: boolean;
}

export default function IssuancePanel({
  inspection,
  onIssued,
  onBack,
  showStepIndicator = true,
}: Props) {
  const [effectiveDate, setEffectiveDate] = useState<Date | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issuedId, setIssuedId] = useState<number | null>(null);

  useEffect(() => {
    setEffectiveDate(null);
    setExpiryDate(null);
    setError(null);
    setIssuedId(null);
  }, [inspection]);

  const validate = () => {
    if (!effectiveDate) return "กรุณาเลือกวันที่มีผล";
    if (!expiryDate) return "กรุณาเลือกวันที่หมดอายุ";
    const max = new Date(effectiveDate);
    max.setFullYear(max.getFullYear() + 2);
    if (expiryDate > max) return "วันที่หมดอายุต้องไม่เกิน 2 ปีจากวันที่มีผล";
    if (expiryDate < effectiveDate)
      return "วันที่หมดอายุต้องมากกว่าหรือเท่ากับวันที่มีผล";
    return null;
  };

  const handleIssue = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const resp = await fetch("/api/v1/certificates/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspectionId: inspection.inspectionId,
          effectiveDate: effectiveDate?.toISOString(),
          expiryDate: expiryDate?.toISOString(),
        }),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to create certificate");
      }

      const created = await resp.json();
      const id = (created as any).certificateId || (created as any).id;
      if (!id) throw new Error("Server did not return certificate id");
      setIssuedId(Number(id));

      // PrimaryUpload watches idReference and will flush cached files
      // Give a short delay then notify parent
      setTimeout(() => {
        setSubmitting(false);
        onIssued();
      }, 800);
    } catch (err: any) {
      console.error("issue error", err);
      setError(err?.message || "เกิดข้อผิดพลาดในการออกใบรับรอง");
      setSubmitting(false);
    }
  };

  // compute maximum allowed expiry date (2 years from effectiveDate)
  const expiryMax: Date | null = effectiveDate
    ? (() => {
        const d = new Date(effectiveDate);
        d.setFullYear(d.getFullYear() + 2);
        return d;
      })()
    : null;

  // minimum allowed effective date: use inspection date if available
  const effectiveMin: Date | null = inspection?.inspectionDateAndTime
    ? new Date(inspection.inspectionDateAndTime)
    : null;

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      {showStepIndicator ? (
        <StepIndicator
          currentStep={2}
          maxSteps={2}
          stepLabels={["เลือกการตรวจ", "ออกใบรับรอง"]}
        />
      ) : null}

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700">
          การออกใบรับรองสำหรับ: {inspection.inspectionNo}
        </h3>
        <p className="text-xs text-gray-500">
          สถานที่: {inspection.rubberFarm?.villageName || "-"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label
            className="block text-sm text-gray-600 mb-1"
            htmlFor="effectiveDate"
          >
            วันที่มีผล
          </label>
          <PrimaryCalendar
            value={effectiveDate}
            onChange={setEffectiveDate}
            minDate={effectiveMin}
            maxDate={expiryDate}
            id="effectiveDate"
          />
        </div>
        <div>
          <label
            className="block text-sm text-gray-600 mb-1"
            htmlFor="expiryDate"
          >
            วันที่หมดอายุ
          </label>
          <PrimaryCalendar
            value={expiryDate}
            onChange={setExpiryDate}
            minDate={effectiveDate}
            maxDate={expiryMax}
            id="expiryDate"
          />
        </div>
      </div>

      <div className="mt-4">
        <label
          className="block text-sm text-gray-600 mb-2"
          htmlFor="certificateUpload"
        >
          ไฟล์ใบรับรอง (PDF)
        </label>
        <PrimaryUpload
          tableReference="Certificate"
          cacheKey={`certificate-inspection-${inspection.inspectionId}`}
          idReference={issuedId ?? undefined}
          accept="application/pdf"
          multiple={false}
          maxFileSize={10 * 1024 * 1024} // 10 MB
        />
      </div>

      {error && <div className="text-sm text-red-600 mt-3">{error}</div>}

      <div className="mt-4 flex justify-end gap-2">
        {onBack && (
          <PrimaryButton label="ย้อนกลับ" onClick={onBack} color="secondary" />
        )}
        <PrimaryButton
          label="ออกใบรับรอง"
          onClick={handleIssue}
          loading={submitting}
          color="success"
        />
      </div>
    </div>
  );
}
