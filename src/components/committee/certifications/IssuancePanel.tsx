"use client";

import { StepIndicator } from "@/components/farmer/StepIndicator";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryCalendar from "@/components/ui/PrimaryCalendar";
import PrimaryUpload from "@/components/ui/PrimaryUpload";
import { useEffect, useState } from "react";

interface Props {
  readonly inspection: any;
  readonly onIssued: () => void;
  readonly onBack?: () => void;
  readonly showStepIndicator?: boolean;
  readonly issuing?: boolean;
  readonly issueCertificate: (payload: {
    inspectionId: number;
    effectiveDate: Date;
    expiryDate: Date;
  }) => Promise<number>;
}

export default function IssuancePanel({
  inspection,
  onIssued,
  onBack,
  showStepIndicator = true,
  issuing = false,
  issueCertificate,
}: Props) {
  const [effectiveDate, setEffectiveDate] = useState<Date | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [postIssueProcessing, setPostIssueProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issuedId, setIssuedId] = useState<number | null>(null);

  useEffect(() => {
    setEffectiveDate(null);
    setExpiryDate(null);
    setError(null);
    setIssuedId(null);
    setPostIssueProcessing(false);
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
      setError(null);
      const eff = effectiveDate;
      const exp = expiryDate;
      if (!eff || !exp) return;

      const id = await issueCertificate({
        inspectionId: inspection.inspectionId,
        effectiveDate: eff,
        expiryDate: exp,
      });
      setIssuedId(id);
      setPostIssueProcessing(true);

      // PrimaryUpload watches idReference and will flush cached files
      // Give a short delay then notify parent
      setTimeout(() => {
        onIssued();
      }, 800);
    } catch (err: any) {
      console.error("issue error", err);
      if (err?.message === "__BUSY__") return;
      setError(err?.message || "เกิดข้อผิดพลาดในการออกใบรับรอง");
      setPostIssueProcessing(false);
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

  const busy = issuing || postIssueProcessing;

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
            disabled={busy}
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
            disabled={busy}
          />
        </div>
      </div>

      <div className="mt-4">
        <label
          className="block text-sm text-gray-600 mb-2"
          htmlFor="certificateUpload"
        >
          ไฟล์ใบรับรอง (PDF) จำนวน 1 ไฟล์
        </label>
        <PrimaryUpload
          tableReference="Certificate"
          cacheKey={`certificate-inspection-${inspection.inspectionId}`}
          idReference={issuedId ?? undefined}
          accept="application/pdf"
          multiple={false}
          maxFileSize={10 * 1024 * 1024} // 10 MB
          fileValidator={(file) =>
            file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf")
          }
        />
      </div>

      {error && <div className="text-sm text-red-600 mt-3">{error}</div>}

      <div className="mt-4 flex justify-end gap-2">
        {onBack && (
          <PrimaryButton
            label="ย้อนกลับ"
            onClick={onBack}
            color="secondary"
            disabled={busy}
          />
        )}
        <PrimaryButton
          label="ออกใบรับรอง"
          onClick={handleIssue}
          loading={busy}
          color="success"
        />
      </div>
    </div>
  );
}
