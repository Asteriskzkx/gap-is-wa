"use client";

import { PrimaryDataTable } from "@/components/ui";
import { GRID, INFO_CARD, SPACING } from "@/styles/auditorClasses";
import { formatThaiDate } from "@/utils/dateFormatter";

interface Props {
  readonly inspection: any;
}

export default function InspectionInfo({ inspection }: Props) {
  if (!inspection) return null;

  const rawFarmer = inspection?.rubberFarm?.farmer;
  const farmer = rawFarmer?.farmer ?? rawFarmer;
  const auditorChief = inspection?.auditorChief;

  const normalizeText = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const str = String(value).trim();
    return str === "-" ? "" : str;
  };

  const formatFarmerName = (value: any): string => {
    if (!value) return "ไม่มีข้อมูล";
    const namePrefix = normalizeText(value.namePrefix);
    const firstName = normalizeText(value.firstName);
    const lastName = normalizeText(value.lastName);
    const name = [namePrefix, firstName, lastName].filter(Boolean).join(" ");
    return name || "ไม่มีข้อมูล";
  };

  const formatFarmLocation = (farm: any): string => {
    if (!farm) return "-";

    const villageName = normalizeText(farm.villageName);
    const mooNum = Number(farm.moo);
    const moo = Number.isFinite(mooNum) && mooNum >= 0 ? `หมู่ ${mooNum}` : "";
    const road = normalizeText(farm.road);
    const alley = normalizeText(farm.alley);
    const subDistrict = normalizeText(farm.subDistrict);
    const district = normalizeText(farm.district);
    const province = normalizeText(farm.province);

    const parts = [
      villageName,
      moo,
      road,
      alley,
      subDistrict,
      district,
      province,
    ].filter(Boolean);

    return parts.length ? parts.join(" ") : "-";
  };

  const formatAuditorName = (value: any): string => {
    if (!value) return "-";
    const namePrefix = normalizeText(value.namePrefix);
    const firstName = normalizeText(value.firstName);
    const lastName = normalizeText(value.lastName);
    const name = [namePrefix, firstName, lastName].filter(Boolean).join(" ");
    return name || "-";
  };

  const buildAuditors = (): Array<{
    auditorId: number | string;
    name: string;
    email: string;
    role: string;
  }> => {
    const rows = new Map<string, any>();

    const upsert = (auditor: any, role: string) => {
      if (!auditor) return;
      const id = auditor.auditorId ?? auditor.id ?? auditor.auditorID;
      const key = id !== undefined && id !== null ? String(id) : "";
      if (!key) return;

      const email =
        normalizeText(auditor?.user?.email) ||
        normalizeText(auditor?.email) ||
        "-";
      const name = formatAuditorName(auditor);

      const existing = rows.get(key);
      rows.set(key, {
        auditorId: id,
        name,
        email,
        role: existing?.role === "หัวหน้าผู้ตรวจประเมิน" ? existing.role : role,
      });
    };

    if (auditorChief) {
      upsert(auditorChief, "หัวหน้าผู้ตรวจประเมิน");
    }

    if (inspection?.auditorChiefId && !auditorChief) {
      rows.set(String(inspection.auditorChiefId), {
        auditorId: inspection.auditorChiefId,
        name: "-",
        email: "-",
        role: "หัวหน้าผู้ตรวจประเมิน",
      });
    }

    const auditorInspections = Array.isArray(inspection?.auditorInspections)
      ? inspection.auditorInspections
      : [];

    for (const ai of auditorInspections) {
      const auditor = ai?.auditor ?? ai;
      upsert(auditor, "ผู้ตรวจประเมินร่วม");
    }

    return Array.from(rows.values()).sort((a, b) =>
      String(a.auditorId).localeCompare(String(b.auditorId), "th-TH", {
        numeric: true,
      })
    );
  };

  const auditors = buildAuditors();

  return (
    <>
      <div className={INFO_CARD.sectionBorder}>
        <h2 className={INFO_CARD.sectionTitle}>ข้อมูลทั่วไป</h2>
        <div
          className={`${GRID.cols2Md} ${GRID.gap4} ${SPACING.mt4} ${SPACING.mb4}`}
        >
          <div className={INFO_CARD.wrapper}>
            <p className={INFO_CARD.label}>รหัสการตรวจ</p>
            <p className={INFO_CARD.value}>{inspection.inspectionNo}</p>
          </div>
          <div className={INFO_CARD.wrapper}>
            <p className={INFO_CARD.label}>วันที่ตรวจประเมิน</p>
            <p className={INFO_CARD.value}>
              {new Date(inspection.inspectionDateAndTime).toLocaleDateString(
                "th-TH",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </p>
          </div>
          <div className={INFO_CARD.wrapper}>
            <p className={INFO_CARD.label}>ชื่อเกษตรกร</p>
            <p className={INFO_CARD.value}>{formatFarmerName(farmer)}</p>
          </div>
          <div className={INFO_CARD.wrapper}>
            <p className={INFO_CARD.label}>อีเมล</p>
            <p className={INFO_CARD.value}>
              {normalizeText(farmer?.email) || "-"}
            </p>
          </div>
          <div className={INFO_CARD.wrapper}>
            <p className={INFO_CARD.label}>เบอร์โทรศัพท์</p>
            <p className={INFO_CARD.value}>
              {normalizeText(farmer?.phoneNumber) || "-"}
            </p>
          </div>
          <div className={INFO_CARD.wrapper}>
            <p className={INFO_CARD.label}>เบอร์โทรศัพท์มือถือ</p>
            <p className={INFO_CARD.value}>
              {normalizeText(farmer?.mobilePhoneNumber) || "-"}
            </p>
          </div>
          <div className={INFO_CARD.wrapper}>
            <p className={INFO_CARD.label}>สถานที่</p>
            <p className={INFO_CARD.value}>
              {formatFarmLocation(inspection.rubberFarm)}
            </p>
          </div>
          <div className={INFO_CARD.wrapper}>
            <p className={INFO_CARD.label}>ประเภทการตรวจประเมิน</p>
            <p className={INFO_CARD.value}>
              {inspection.inspectionType?.typeName || "ไม่มีข้อมูล"}
            </p>
          </div>
        </div>
      </div>

      <div className={INFO_CARD.sectionBorder}>
        <h2 className={INFO_CARD.sectionTitle}>ผู้ตรวจประเมินที่เกี่ยวข้อง</h2>
        <PrimaryDataTable
          value={auditors}
          columns={[
            {
              field: "auditorId",
              header: "รหัสผู้ตรวจ",
              body: (rowData: any) => rowData.auditorId,
              headerAlign: "center" as const,
              bodyAlign: "center" as const,
              style: { width: "15%" },
            },
            {
              field: "name",
              header: "ชื่อ-นามสกุล",
              body: (rowData: any) => rowData.name,
              headerAlign: "center" as const,
              bodyAlign: "left" as const,
              style: { width: "30%" },
            },
            {
              field: "email",
              header: "อีเมล",
              body: (rowData: any) => rowData.email,
              headerAlign: "center" as const,
              bodyAlign: "left" as const,
              style: { width: "35%" },
            },
            {
              field: "role",
              header: "บทบาท",
              body: (rowData: any) => rowData.role,
              headerAlign: "center" as const,
              bodyAlign: "left" as const,
              style: { width: "20%" },
            },
          ]}
          paginator={false}
          emptyMessage="ไม่พบข้อมูลผู้ตรวจประเมิน"
          className="w-full"
        />
      </div>

      <div className={INFO_CARD.sectionBorder}>
        <h2 className={INFO_CARD.sectionTitle}>รายละเอียดการปลูก</h2>
        {Array.isArray(inspection.rubberFarm?.plantingDetails) &&
        inspection.rubberFarm.plantingDetails.length > 0 ? (
          <PrimaryDataTable
            value={inspection.rubberFarm.plantingDetails}
            columns={[
              {
                field: "specie",
                header: "พันธุ์ยางพารา",
                body: (rowData: any) => rowData.specie,
                headerAlign: "center" as const,
                bodyAlign: "left" as const,
              },
              {
                field: "areaOfPlot",
                header: "พื้นที่แปลง (ไร่)",
                body: (rowData: any) => rowData.areaOfPlot,
                headerAlign: "center" as const,
                bodyAlign: "right" as const,
              },
              {
                field: "numberOfRubber",
                header: "จำนวนต้นยางทั้งหมด (ต้น)",
                body: (rowData: any) => rowData.numberOfRubber,
                headerAlign: "center" as const,
                bodyAlign: "right" as const,
              },
              {
                field: "numberOfTapping",
                header: "จำนวนต้นยางที่กรีดได้ (ต้น)",
                body: (rowData: any) => rowData.numberOfTapping,
                headerAlign: "center" as const,
                bodyAlign: "right" as const,
              },
              {
                field: "ageOfRubber",
                header: "อายุต้นยาง (ปี)",
                body: (rowData: any) => rowData.ageOfRubber,
                headerAlign: "center" as const,
                bodyAlign: "right" as const,
              },
              {
                field: "yearOfTapping",
                header: "ปีที่เริ่มกรีด",
                body: (rowData: any) =>
                  formatThaiDate(rowData.yearOfTapping, "year"),
                headerAlign: "center" as const,
                bodyAlign: "center" as const,
              },
              {
                field: "monthOfTapping",
                header: "เดือนที่เริ่มกรีด",
                body: (rowData: any) =>
                  formatThaiDate(rowData.monthOfTapping, "month"),
                headerAlign: "center" as const,
                bodyAlign: "center" as const,
              },
              {
                field: "totalProduction",
                header: "ผลผลิตรวม (กก./ปี)",
                body: (rowData: any) => rowData.totalProduction,
                headerAlign: "center" as const,
                bodyAlign: "right" as const,
              },
            ]}
            paginator={false}
            emptyMessage="ไม่มีข้อมูลรายละเอียดการปลูก"
            className="w-full"
          />
        ) : (
          <p className={INFO_CARD.value}>ไม่มีข้อมูลรายละเอียดการปลูก</p>
        )}
      </div>
    </>
  );
}
