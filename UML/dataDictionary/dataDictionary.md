# พจนานุกรมข้อมูล (Data Dictionary)

อ้างอิงจากไฟล์ `prisma/schema.prisma`

## ตารางที่ 3.2 พจนานุกรมข้อมูลของ Enum `UserRole`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| BASIC | ผู้ใช้ทั่วไป | ENUM | Variable | - | - |
| FARMER | เกษตรกร | ENUM | Variable | - | - |
| AUDITOR | ผู้ตรวจประเมิน | ENUM | Variable | - | - |
| COMMITTEE | คณะกรรมการ | ENUM | Variable | - | - |
| ADMIN | ผู้ดูแลระบบ | ENUM | Variable | - | - |

## ตารางที่ 3.3 พจนานุกรมข้อมูลของตาราง `User`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| userId | รหัสเฉพาะสำหรับผู้ใช้แต่ละราย (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| email | อีเมลของผู้ใช้ (ไม่ซ้ำ) | VARCHAR | 100 | Unique | - |
| hashedPassword | รหัสผ่านแบบแฮช (bcrypt) | VARCHAR | 60 | - | - |
| name | ชื่อ-นามสกุล/ชื่อที่แสดง | VARCHAR | 200 | - | - |
| role | บทบาทผู้ใช้ (ค่าเริ่มต้น: `BASIC`) | ENUM (`UserRole`) | Variable | - | - |
| requirePasswordChange | ต้องเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งแรก (ค่าเริ่มต้น: `true`) | BOOLEAN | 1 byte | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

## ตารางที่ 3.4 พจนานุกรมข้อมูลของตาราง `Farmer`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| farmerId | รหัสเฉพาะสำหรับเกษตรกรแต่ละราย (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| userId | อ้างอิง `userId` ในตาราง `User` (ไม่ซ้ำ) | INT | 4 bytes | Foreign, Unique | User |
| namePrefix | คำนำหน้าชื่อ | VARCHAR | 25 | - | - |
| firstName | ชื่อจริง | VARCHAR | 100 | - | - |
| lastName | นามสกุล | VARCHAR | 100 | - | - |
| identificationNumber | เลขประจำตัวประชาชน (ไม่ซ้ำ) | VARCHAR | 13 | Unique | - |
| birthDate | วัน/เวลาเกิด | TIMESTAMP | 8 bytes | - | - |
| gender | เพศ | VARCHAR | 50 | - | - |
| houseNo | บ้านเลขที่ | VARCHAR | 10 | - | - |
| villageName | ชื่อหมู่บ้าน | VARCHAR | 255 | - | - |
| moo | หมู่ที่ | INT | 4 bytes | - | - |
| road | ถนน | VARCHAR | 100 | - | - |
| alley | ตรอก/ซอย | VARCHAR | 100 | - | - |
| subDistrict | แขวง/ตำบล | VARCHAR | 100 | - | - |
| district | เขต/อำเภอ | VARCHAR | 100 | - | - |
| provinceName | จังหวัด | VARCHAR | 100 | - | - |
| zipCode | รหัสไปรษณีย์ | VARCHAR | 5 | - | - |
| phoneNumber | โทรศัพท์บ้าน | VARCHAR | 10 | - | - |
| mobilePhoneNumber | โทรศัพท์มือถือ | VARCHAR | 10 | - | - |
| version | เวอร์ชันข้อมูล (ค่าเริ่มต้น: 0) | INT | 4 bytes | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

## ตารางที่ 3.5 พจนานุกรมข้อมูลของตาราง `Auditor`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| auditorId | รหัสเฉพาะสำหรับผู้ตรวจประเมิน (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| userId | อ้างอิง `userId` ในตาราง `User` (ไม่ซ้ำ) | INT | 4 bytes | Foreign, Unique | User |
| namePrefix | คำนำหน้าชื่อ | VARCHAR | 25 | - | - |
| firstName | ชื่อจริง | VARCHAR | 100 | - | - |
| lastName | นามสกุล | VARCHAR | 100 | - | - |
| version | เวอร์ชันข้อมูล (ค่าเริ่มต้น: 0) | INT | 4 bytes | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

## ตารางที่ 3.6 พจนานุกรมข้อมูลของตาราง `Committee`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| committeeId | รหัสเฉพาะสำหรับคณะกรรมการ (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| userId | อ้างอิง `userId` ในตาราง `User` (ไม่ซ้ำ) | INT | 4 bytes | Foreign, Unique | User |
| namePrefix | คำนำหน้าชื่อ | VARCHAR | 25 | - | - |
| firstName | ชื่อจริง | VARCHAR | 100 | - | - |
| lastName | นามสกุล | VARCHAR | 100 | - | - |
| version | เวอร์ชันข้อมูล (ค่าเริ่มต้น: 0) | INT | 4 bytes | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

## ตารางที่ 3.7 พจนานุกรมข้อมูลของตาราง `Admin`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| adminId | รหัสเฉพาะสำหรับผู้ดูแลระบบ (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| userId | อ้างอิง `userId` ในตาราง `User` (ไม่ซ้ำ) | INT | 4 bytes | Foreign, Unique | User |
| namePrefix | คำนำหน้าชื่อ | VARCHAR | 25 | - | - |
| firstName | ชื่อจริง | VARCHAR | 100 | - | - |
| lastName | นามสกุล | VARCHAR | 100 | - | - |
| version | เวอร์ชันข้อมูล (ค่าเริ่มต้น: 0) | INT | 4 bytes | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

## ตารางที่ 3.8 พจนานุกรมข้อมูลของตาราง `RubberFarm`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| rubberFarmId | รหัสเฉพาะสำหรับแปลงสวนยางพารา (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| farmerId | อ้างอิง `farmerId` ในตาราง `Farmer` | INT | 4 bytes | Foreign | Farmer |
| villageName | ชื่อหมู่บ้าน | VARCHAR | 255 | - | - |
| moo | หมู่ที่ | INT | 4 bytes | - | - |
| road | ถนน | VARCHAR | 100 | - | - |
| alley | ตรอก/ซอย | VARCHAR | 100 | - | - |
| subDistrict | แขวง/ตำบล | VARCHAR | 100 | - | - |
| district | เขต/อำเภอ | VARCHAR | 100 | - | - |
| province | จังหวัด | VARCHAR | 100 | - | - |
| location | ตำแหน่งแปลงสวนยางพารา (GeoJSON) | JSONB | Variable | - | - |
| productDistributionType | ประเภทการกระจายผลผลิต (ค่าเริ่มต้น: `""`) | VARCHAR | 50 | - | - |
| version | เวอร์ชันข้อมูล (ค่าเริ่มต้น: 0) | INT | 4 bytes | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

## ตารางที่ 3.9 พจนานุกรมข้อมูลของตาราง `PlantingDetail`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| plantingDetailId | รหัสเฉพาะสำหรับรายละเอียดการปลูก (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| rubberFarmId | อ้างอิง `rubberFarmId` ในตาราง `RubberFarm` | INT | 4 bytes | Foreign | RubberFarm |
| specie | พันธุ์ยางพารา | VARCHAR | 100 | - | - |
| areaOfPlot | พื้นที่การผลิตรวม (ไร่) | FLOAT8 | 8 bytes | - | - |
| numberOfRubber | จำนวนต้นยาง | INT | 4 bytes | - | - |
| numberOfTapping | จำนวนต้นที่เปิดกรีด | INT | 4 bytes | - | - |
| ageOfRubber | อายุพืชยาง | INT | 4 bytes | - | - |
| yearOfTapping | ปีที่กรีด | TIMESTAMP | 8 bytes | - | - |
| monthOfTapping | เดือนที่เริ่มกรีดยางในปีปัจจุบัน | TIMESTAMP | 8 bytes | - | - |
| totalProduction | ผลผลิตรวมที่คาดว่าจะได้รับต่อปี | FLOAT8 | 8 bytes | - | - |
| version | เวอร์ชันข้อมูล (ค่าเริ่มต้น: 0) | INT | 4 bytes | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

## ตารางที่ 3.10 พจนานุกรมข้อมูลของตาราง `InspectionTypeMaster`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| inspectionTypeId | รหัสเฉพาะประเภทการตรวจประเมิน (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| typeName | ชื่อประเภทการตรวจประเมิน | VARCHAR | 100 | - | - |
| description | คำอธิบายประเภทการตรวจประเมิน (nullable) | TEXT | Variable | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

## ตารางที่ 3.11 พจนานุกรมข้อมูลของตาราง `InspectionItemMaster`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| inspectionItemId | รหัสเฉพาะหัวข้อรายการตรวจ (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| inspectionTypeId | อ้างอิง `inspectionTypeId` ในตาราง `InspectionTypeMaster` | INT | 4 bytes | Foreign | InspectionTypeMaster |
| itemNo | ลำดับหัวข้อรายการตรวจ | INT | 4 bytes | - | - |
| itemName | ชื่อหัวข้อรายการตรวจ | VARCHAR | 100 | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

## ตารางที่ 3.12 พจนานุกรมข้อมูลของตาราง `RequirementMaster`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| requirementId | รหัสเฉพาะข้อกำหนด (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| inspectionItemId | อ้างอิง `inspectionItemId` ในตาราง `InspectionItemMaster` | INT | 4 bytes | Foreign | InspectionItemMaster |
| requirementNo | ลำดับข้อกำหนด | INT | 4 bytes | - | - |
| requirementName | รายละเอียดข้อกำหนด | VARCHAR | 255 | - | - |
| requirementLevel | ระดับข้อกำหนด | VARCHAR | 50 | - | - |
| requirementLevelNo | รหัส/ระดับข้อกำหนด (เช่น เลข/สัญลักษณ์) | VARCHAR | 50 | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

## ตารางที่ 3.13 พจนานุกรมข้อมูลของตาราง `Inspection`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| inspectionId | รหัสเฉพาะสำหรับการตรวจประเมิน (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| inspectionNo | เลขที่/ลำดับการตรวจประเมิน | INT | 4 bytes | - | - |
| inspectionDateAndTime | วัน/เวลาที่ทำการตรวจประเมิน | TIMESTAMP | 8 bytes | - | - |
| inspectionTypeId | อ้างอิง `inspectionTypeId` ในตาราง `InspectionTypeMaster` | INT | 4 bytes | Foreign | InspectionTypeMaster |
| inspectionStatus | สถานะการตรวจประเมิน | VARCHAR | 100 | - | - |
| inspectionResult | ผลลัพธ์การตรวจประเมิน | VARCHAR | 100 | - | - |
| auditorChiefId | อ้างอิง `auditorId` (หัวหน้าคณะตรวจ) ในตาราง `Auditor` | INT | 4 bytes | Foreign | Auditor |
| rubberFarmId | อ้างอิง `rubberFarmId` ในตาราง `RubberFarm` | INT | 4 bytes | Foreign | RubberFarm |
| version | เวอร์ชันข้อมูล (ค่าเริ่มต้น: 0) | INT | 4 bytes | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

## ตารางที่ 3.14 พจนานุกรมข้อมูลของตาราง `AuditorInspection`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| auditorInspectionId | รหัสเฉพาะสำหรับความสัมพันธ์ผู้ตรวจ-การตรวจประเมิน (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| auditorId | อ้างอิง `auditorId` ในตาราง `Auditor` | INT | 4 bytes | Foreign | Auditor |
| inspectionId | อ้างอิง `inspectionId` ในตาราง `Inspection` | INT | 4 bytes | Foreign | Inspection |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

หมายเหตุ: มีข้อกำหนด `@@unique([auditorId, inspectionId])` เพื่อไม่ให้ซ้ำกัน

## ตารางที่ 3.15 พจนานุกรมข้อมูลของตาราง `InspectionItem`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| inspectionItemId | รหัสเฉพาะสำหรับรายการตรวจ (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| inspectionId | อ้างอิง `inspectionId` ในตาราง `Inspection` | INT | 4 bytes | Foreign | Inspection |
| inspectionItemMasterId | อ้างอิง `inspectionItemId` ในตาราง `InspectionItemMaster` | INT | 4 bytes | Foreign | InspectionItemMaster |
| inspectionItemNo | ลำดับรายการตรวจในครั้งนั้น | INT | 4 bytes | - | - |
| inspectionItemResult | ผลการตรวจของรายการตรวจ | VARCHAR | 100 | - | - |
| otherConditions | ข้อมูลเงื่อนไขเพิ่มเติม (เก็บเป็นรายการข้อความใน JSON) | JSONB | Variable | - | - |
| version | เวอร์ชันข้อมูล (ค่าเริ่มต้น: 0) | INT | 4 bytes | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

## ตารางที่ 3.16 พจนานุกรมข้อมูลของตาราง `Requirement`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| requirementId | รหัสเฉพาะสำหรับการประเมินข้อกำหนด (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| inspectionItemId | อ้างอิง `inspectionItemId` ในตาราง `InspectionItem` | INT | 4 bytes | Foreign | InspectionItem |
| requirementMasterId | อ้างอิง `requirementId` ในตาราง `RequirementMaster` | INT | 4 bytes | Foreign | RequirementMaster |
| requirementNo | ลำดับข้อกำหนด | INT | 4 bytes | - | - |
| evaluationResult | ผลการตรวจประเมิน | VARCHAR | 20 | - | - |
| evaluationMethod | วิธีการตรวจประเมิน | VARCHAR | 20 | - | - |
| note | หมายเหตุ | VARCHAR | 255 | - | - |
| version | เวอร์ชันข้อมูล (ค่าเริ่มต้น: 0) | INT | 4 bytes | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

## ตารางที่ 3.17 พจนานุกรมข้อมูลของตาราง `DataRecord`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| dataRecordId | รหัสเฉพาะสำหรับบันทึกข้อมูล (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| inspectionId | อ้างอิง `inspectionId` ในตาราง `Inspection` (ไม่ซ้ำ) | INT | 4 bytes | Foreign, Unique | Inspection |
| species | ข้อมูลชนิด/พันธุ์ที่ปลูก (JSON) | JSONB | Variable | - | - |
| waterSystem | ข้อมูลระบบการให้น้ำ (JSON) | JSONB | Variable | - | - |
| fertilizers | ข้อมูลการใช้ปุ๋ย/สารปรับปรุงดิน (JSON) | JSONB | Variable | - | - |
| previouslyCultivated | ประวัติการใช้พื้นที่/การปลูกย้อนหลัง (JSON) | JSONB | Variable | - | - |
| plantDisease | ข้อมูลโรคพืช/ศัตรูพืช (JSON) | JSONB | Variable | - | - |
| relatedPlants | ข้อมูลพืชที่เกี่ยวข้อง/ปลูกร่วม (JSON) | JSONB | Variable | - | - |
| moreInfo | ข้อมูลเพิ่มเติม | VARCHAR | 255 | - | - |
| map | ตำแหน่งที่ตั้ง (GeoJSON) | JSONB | Variable | - | - |
| version | เวอร์ชันข้อมูล (ค่าเริ่มต้น: 0) | INT | 4 bytes | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

## ตารางที่ 3.18 พจนานุกรมข้อมูลของตาราง `AdviceAndDefect`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| adviceAndDefectId | รหัสเฉพาะสำหรับคำแนะนำและข้อบกพร่อง (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| inspectionId | อ้างอิง `inspectionId` ในตาราง `Inspection` (ไม่ซ้ำ) | INT | 4 bytes | Foreign, Unique | Inspection |
| date | วันที่/เวลาที่ให้คำแนะนำและข้อบกพร่อง | TIMESTAMP | 8 bytes | - | - |
| adviceList | รายการคำแนะนำ (JSON) | JSONB | Variable | - | - |
| defectList | รายการข้อบกพร่อง (JSON) | JSONB | Variable | - | - |
| version | เวอร์ชันข้อมูล (ค่าเริ่มต้น: 0) | INT | 4 bytes | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

## ตารางที่ 3.19 พจนานุกรมข้อมูลของตาราง `Certificate`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| certificateId | รหัสเฉพาะสำหรับใบรับรอง (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| inspectionId | อ้างอิง `inspectionId` ในตาราง `Inspection` (ไม่ซ้ำ) | INT | 4 bytes | Foreign, Unique | Inspection |
| effectiveDate | วัน/เวลาที่มีผลบังคับใช้ (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| expiryDate | วัน/เวลาหมดอายุ | TIMESTAMP | 8 bytes | - | - |
| cancelRequestFlag | สถานะคำขอยกเลิกใบรับรอง (ค่าเริ่มต้น: `false`) | BOOLEAN | 1 byte | - | - |
| cancelRequestDetail | รายละเอียดคำขอยกเลิก (nullable) | VARCHAR | 255 | - | - |
| activeFlag | สถานะใช้งานใบรับรอง (ค่าเริ่มต้น: `true`) | BOOLEAN | 1 byte | - | - |
| version | เวอร์ชันข้อมูล (ค่าเริ่มต้น: 0) | INT | 4 bytes | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

## ตารางที่ 3.20 พจนานุกรมข้อมูลของตาราง `CommitteeCertificate`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| committeeCertificateId | รหัสเฉพาะสำหรับความสัมพันธ์กรรมการ-ใบรับรอง (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| committeeId | อ้างอิง `committeeId` ในตาราง `Committee` | INT | 4 bytes | Foreign | Committee |
| certificateId | อ้างอิง `certificateId` ในตาราง `Certificate` | INT | 4 bytes | Foreign | Certificate |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

หมายเหตุ: มีข้อกำหนด `@@unique([committeeId, certificateId])` เพื่อไม่ให้ซ้ำกัน

## ตารางที่ 3.21 พจนานุกรมข้อมูลของตาราง `File`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| fileId | รหัสเฉพาะสำหรับไฟล์ (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| tableReference | ชื่อตาราง/ทรัพยากรที่ไฟล์นี้อ้างถึง (เช่น `Certificate`, `Inspection`) | VARCHAR | 100 | - | - |
| idReference | ค่าคีย์หลักของตารางที่อ้างถึง (อ้างอิงตาม `tableReference`) | INT | 4 bytes | - | - |
| fileName | ชื่อไฟล์ | VARCHAR | 255 | - | - |
| mimeType | ประเภทไฟล์ (MIME Type) (nullable) | VARCHAR | 100 | - | - |
| url | URL ที่จัดเก็บไฟล์ (เช่น UploadThing / S3 / CDN) | VARCHAR | 1024 | - | - |
| fileKey | คีย์ภายในของผู้ให้บริการสำหรับลบไฟล์ได้ถูกต้อง (nullable) | VARCHAR | 255 | - | - |
| size | ขนาดไฟล์ (ไบต์) (nullable) | INT | 4 bytes | - | - |
| version | เวอร์ชันข้อมูล (ค่าเริ่มต้น: 0) | INT | 4 bytes | - | - |
| createdAt | วัน/เวลาที่สร้างข้อมูล (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |
| updatedAt | วัน/เวลาที่แก้ไขล่าสุด (อัปเดตอัตโนมัติ) | TIMESTAMP | 8 bytes | - | - |

หมายเหตุ: มีดัชนี `@@index([tableReference, idReference])` สำหรับการค้นหาแบบอ้างอิงข้ามตาราง

## ตารางที่ 3.22 พจนานุกรมข้อมูลของตาราง `AuditLog`

| ชื่อแอตทริบิวต์ | คำอธิบาย | ประเภทข้อมูล | ขนาดข้อมูล | คีย์ | อ้างอิง |
| --- | --- | --- | --- | --- | --- |
| auditLogId | รหัสเฉพาะสำหรับบันทึกการเปลี่ยนแปลงข้อมูล (Auto Increment) | SERIAL | 4 bytes | Primary | - |
| tableName | ชื่อตารางที่เกิดเหตุการณ์ | VARCHAR | 100 | - | - |
| action | ประเภทการกระทำ (เช่น `CREATE`, `UPDATE`, `DELETE`) | VARCHAR | 20 | - | - |
| recordId | รหัสรายการ (คีย์หลักของแถวที่เปลี่ยนแปลง) | INT | 4 bytes | - | - |
| userId | รหัสผู้ใช้ที่ทำรายการ (nullable) | INT | 4 bytes | - | - |
| oldData | ข้อมูลเดิม (ใช้กับ `UPDATE`/`DELETE`) (nullable) | JSONB | Variable | - | - |
| newData | ข้อมูลใหม่ (ใช้กับ `CREATE`/`UPDATE`) (nullable) | JSONB | Variable | - | - |
| createdAt | วัน/เวลาที่บันทึกเหตุการณ์ (ค่าเริ่มต้น: now()) | TIMESTAMP | 8 bytes | - | - |

หมายเหตุ: มีดัชนี `@@index([tableName, recordId])`, `@@index([userId])`, `@@index([createdAt])`
