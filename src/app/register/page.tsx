"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

// Import reusable components
import PrimaryAutoComplete from "@/components/ui/PrimaryAutoComplete";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryCalendar from "@/components/ui/PrimaryCalendar";
import PrimaryDropdown from "@/components/ui/PrimaryDropdown";
import PrimaryInputMask from "@/components/ui/PrimaryInputMask";
import PrimaryInputText from "@/components/ui/PrimaryInputText";
import PrimaryPassword from "@/components/ui/PrimaryPassword";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import styles from "./register.module.css";

export default function FarmerRegisterPage() {
  const {
    isLoading,
    error,
    step,
    formData,
    errors,
    isLoadingProvinces,
    namePrefixOptions,
    genderOptions,
    provinceOptions,
    amphureOptions,
    tambonOptions,
    amphures,
    tambons,
    setFormData,
    nextStep,
    prevStep,
    handleSubmit,
  } = useRegisterForm();

  return (
    <div className={styles.registerContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <Link href="/" className={styles.logoLink}>
            <Image
              src="/logo.png"
              alt="การยางแห่งประเทศไทย"
              width={100}
              height={100}
              priority
            />
          </Link>
          <h1 className={styles.title}>ลงทะเบียนเกษตรกรใหม่</h1>
          <p className={styles.subtitle}>
            สร้างบัญชีผู้ใช้สำหรับระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
          </p>
        </div>

        {/* Step progress bar and indicators */}
        <div className={styles.stepProgressWrapper}>
          {/* Desktop Version */}
          <div className={styles.stepProgressDesktop}>
            <div className={styles.stepProgressContainer}>
              {[1, 2, 3, 4].map((s, index) => (
                <React.Fragment key={s}>
                  <div className={styles.stepItem}>
                    <div
                      className={`${styles.stepCircle} ${
                        s === step
                          ? styles.stepCircleActive
                          : s < step
                          ? styles.stepCircleCompleted
                          : styles.stepCircleInactive
                      }`}
                    >
                      {s < step ? (
                        <svg
                          className={styles.checkIcon}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        s
                      )}
                    </div>

                    <div
                      className={`${styles.stepLabel} ${
                        s === step
                          ? styles.stepLabelActive
                          : s < step
                          ? styles.stepLabelCompleted
                          : styles.stepLabelInactive
                      }`}
                    >
                      {s === 1 && "บัญชีผู้ใช้"}
                      {s === 2 && "ข้อมูลส่วนตัว"}
                      {s === 3 && "ที่อยู่"}
                      {s === 4 && "ติดต่อ"}
                    </div>
                  </div>

                  {index < 3 && (
                    <div className={styles.stepConnector}>
                      <div
                        className={`${styles.stepConnectorLine} ${
                          s < step
                            ? styles.stepConnectorActive
                            : styles.stepConnectorInactive
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Mobile Version */}
          <div className={styles.stepProgressMobile}>
            <div className={styles.stepIndicators}>
              <div className={styles.stepIndicatorsContainer}>
                {[1, 2, 3, 4].map((s, index) => {
                  const getStepClass = () => {
                    if (s === step) return styles.stepCircleActive;
                    if (s < step) return styles.stepCircleCompleted;
                    return styles.stepCircleInactive;
                  };

                  return (
                    <React.Fragment key={s}>
                      <div
                        className={`${styles.stepDotMobile} ${getStepClass()}`}
                      >
                        {s < step ? (
                          <svg
                            className={styles.checkIconMobile}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          s
                        )}
                      </div>
                      {index < 3 && (
                        <div
                          className={`${styles.stepConnectorMobile} ${
                            s < step
                              ? styles.stepConnectorActive
                              : styles.stepConnectorInactive
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className={styles.stepInfo}>
              <div className={styles.stepInfoTitle}>
                ขั้นตอนที่ {step}: {step === 1 && "บัญชีผู้ใช้"}
                {step === 2 && "ข้อมูลส่วนตัว"}
                {step === 3 && "ที่อยู่"}
                {step === 4 && "ติดต่อ"}
              </div>
              <div className={styles.stepInfoSubtitle}>
                {step} จาก 4 ขั้นตอน
              </div>
            </div>
          </div>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Step 1: ข้อมูลบัญชีผู้ใช้ */}
            {step === 1 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>ข้อมูลบัญชีผู้ใช้</h2>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    อีเมล <span className={styles.required}>*</span>
                  </label>
                  <PrimaryInputText
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, email: value }))
                    }
                    placeholder="email@example.com"
                    required
                    autoComplete="email"
                    invalid={!!errors.email}
                    errorMessage={errors.email}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    รหัสผ่าน <span className={styles.required}>*</span>
                  </label>
                  <PrimaryPassword
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, password: value }))
                    }
                    placeholder="รหัสผ่านอย่างน้อย 8 ตัวอักษร"
                    required
                    autoComplete="new-password"
                    feedback={false}
                    toggleMask
                    invalid={!!errors.password}
                    errorMessage={errors.password}
                  />
                  <p className={styles.helpText}>
                    รหัสผ่านควรมีความยาวอย่างน้อย 8 ตัวอักษร
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    ยืนยันรหัสผ่าน <span className={styles.required}>*</span>
                  </label>
                  <PrimaryPassword
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: value,
                      }))
                    }
                    placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                    required
                    autoComplete="new-password"
                    feedback={false}
                    toggleMask
                    invalid={!!errors.confirmPassword}
                    errorMessage={errors.confirmPassword}
                  />
                </div>
              </div>
            )}

            {/* Step 2: ข้อมูลส่วนตัว */}
            {step === 2 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>ข้อมูลส่วนตัว</h2>

                <div className={styles.formGroup}>
                  <label htmlFor="namePrefix" className={styles.label}>
                    คำนำหน้า <span className={styles.required}>*</span>
                  </label>
                  <PrimaryDropdown
                    id="namePrefix"
                    name="namePrefix"
                    value={formData.namePrefix}
                    options={namePrefixOptions}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, namePrefix: value }))
                    }
                    placeholder="เลือกคำนำหน้า"
                    required
                    invalid={!!errors.namePrefix}
                    errorMessage={errors.namePrefix}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="firstName" className={styles.label}>
                    ชื่อ <span className={styles.required}>*</span>
                  </label>
                  <PrimaryInputText
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={(value) => {
                      const regex = /^[a-zA-Zก-ฮะ-์\s]*$/;
                      if (regex.test(value)) {
                        setFormData((prev) => ({
                          ...prev,
                          firstName: value,
                        }));
                      }
                    }}
                    placeholder="ชื่อ"
                    maxLength={100}
                    required
                    invalid={!!errors.firstName}
                    errorMessage={errors.firstName}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="lastName" className={styles.label}>
                    นามสกุล <span className={styles.required}>*</span>
                  </label>
                  <PrimaryInputText
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={(value) => {
                      const regex = /^[a-zA-Zก-ฮะ-์\s]*$/;
                      if (regex.test(value)) {
                        setFormData((prev) => ({ ...prev, lastName: value }));
                      }
                    }}
                    placeholder="นามสกุล"
                    maxLength={100}
                    required
                    invalid={!!errors.lastName}
                    errorMessage={errors.lastName}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label
                    htmlFor="identificationNumber"
                    className={styles.label}
                  >
                    เลขบัตรประจำตัวประชาชน{" "}
                    <span className={styles.required}>*</span>
                  </label>
                  <PrimaryInputMask
                    id="identificationNumber"
                    name="identificationNumber"
                    value={formData.identificationNumber}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        identificationNumber: value,
                      }))
                    }
                    mask="9-9999-99999-99-9"
                    placeholder="X-XXXX-XXXXX-XX-X"
                    required
                    invalid={!!errors.identificationNumber}
                    errorMessage={errors.identificationNumber}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="birthDate" className={styles.label}>
                    วันเดือนปีเกิด <span className={styles.required}>*</span>
                  </label>
                  <PrimaryCalendar
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, birthDate: value }))
                    }
                    placeholder="เลือกวันเกิด"
                    dateFormat="dd/mm/yy"
                    showIcon
                    minDate={new Date("1900-01-01")}
                    maxDate={new Date()}
                    required
                    invalid={!!errors.birthDate}
                    errorMessage={errors.birthDate}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="gender" className={styles.label}>
                    เพศ <span className={styles.required}>*</span>
                  </label>
                  <PrimaryDropdown
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    options={genderOptions}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, gender: value }))
                    }
                    placeholder="เลือกเพศ"
                    required
                    invalid={!!errors.gender}
                    errorMessage={errors.gender}
                  />
                </div>
              </div>
            )}

            {/* Step 3: ข้อมูลที่อยู่ */}
            {step === 3 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>ข้อมูลที่อยู่</h2>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="houseNo" className={styles.label}>
                      บ้านเลขที่ <span className={styles.required}>*</span>
                    </label>
                    <PrimaryInputText
                      id="houseNo"
                      name="houseNo"
                      value={formData.houseNo}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, houseNo: value }))
                      }
                      placeholder="บ้านเลขที่"
                      maxLength={10}
                      required
                      invalid={!!errors.houseNo}
                      errorMessage={errors.houseNo}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="villageName" className={styles.label}>
                      หมู่บ้าน <span className={styles.required}>*</span>
                    </label>
                    <PrimaryInputText
                      id="villageName"
                      name="villageName"
                      value={formData.villageName}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, villageName: value }))
                      }
                      placeholder="ชื่อหมู่บ้าน"
                      maxLength={255}
                      required
                      invalid={!!errors.villageName}
                      errorMessage={errors.villageName}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="moo" className={styles.label}>
                      หมู่ที่ <span className={styles.required}>*</span>
                    </label>
                    <PrimaryInputText
                      id="moo"
                      name="moo"
                      type="number"
                      value={formData.moo}
                      onChange={(value) => {
                        const numValue = Number.parseInt(value, 10);
                        if (
                          value === "" ||
                          (!Number.isNaN(numValue) &&
                            numValue >= 0 &&
                            numValue <= 1000)
                        ) {
                          setFormData((prev) => ({ ...prev, moo: value }));
                        }
                      }}
                      placeholder="หมู่ที่"
                      required
                      invalid={!!errors.moo}
                      errorMessage={errors.moo}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="road" className={styles.label}>
                      ถนน <span className={styles.required}>*</span>
                    </label>
                    <PrimaryInputText
                      id="road"
                      name="road"
                      value={formData.road}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, road: value }))
                      }
                      placeholder="ชื่อถนน"
                      maxLength={100}
                      required
                      invalid={!!errors.road}
                      errorMessage={errors.road}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="alley" className={styles.label}>
                    ซอย <span className={styles.required}>*</span>
                  </label>
                  <PrimaryInputText
                    id="alley"
                    name="alley"
                    value={formData.alley}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, alley: value }))
                    }
                    placeholder="ชื่อซอย"
                    maxLength={100}
                    required
                    invalid={!!errors.alley}
                    errorMessage={errors.alley}
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="provinceId" className={styles.label}>
                      จังหวัด <span className={styles.required}>*</span>
                    </label>
                    {isLoadingProvinces ? (
                      <div className={styles.loadingBox}>
                        <i
                          className={`pi pi-spin pi-spinner text-green-600 ${styles.loadingIcon}`}
                        ></i>
                        <span className={styles.loadingText}>
                          กำลังโหลดข้อมูล...
                        </span>
                      </div>
                    ) : (
                      <PrimaryAutoComplete
                        id="provinceId"
                        name="provinceId"
                        value={formData.provinceId}
                        options={provinceOptions}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            provinceId: value,
                          }))
                        }
                        placeholder="เลือกหรือพิมพ์ค้นหาจังหวัด"
                        required
                        invalid={!!errors.provinceId}
                        errorMessage={errors.provinceId}
                      />
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="amphureId" className={styles.label}>
                      อำเภอ/เขต <span className={styles.required}>*</span>
                    </label>
                    <PrimaryAutoComplete
                      id="amphureId"
                      name="amphureId"
                      value={formData.amphureId}
                      options={amphureOptions}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, amphureId: value }))
                      }
                      placeholder="เลือกหรือพิมพ์ค้นหาอำเภอ/เขต"
                      disabled={amphures.length === 0 || isLoadingProvinces}
                      required
                      invalid={!!errors.amphureId}
                      errorMessage={errors.amphureId}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="tambonId" className={styles.label}>
                      ตำบล/แขวง <span className={styles.required}>*</span>
                    </label>
                    <PrimaryAutoComplete
                      id="tambonId"
                      name="tambonId"
                      value={formData.tambonId}
                      options={tambonOptions}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, tambonId: value }))
                      }
                      placeholder="เลือกหรือพิมพ์ค้นหาตำบล/แขวง"
                      disabled={tambons.length === 0}
                      required
                      invalid={!!errors.tambonId}
                      errorMessage={errors.tambonId}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="zipCode" className={styles.label}>
                      รหัสไปรษณีย์ <span className={styles.required}>*</span>
                    </label>
                    <PrimaryInputText
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, zipCode: value }))
                      }
                      placeholder="รหัสไปรษณีย์"
                      disabled
                      className={styles.inputDisabled}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: ข้อมูลการติดต่อ */}
            {step === 4 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>ข้อมูลการติดต่อ</h2>

                <div className={styles.formGroup}>
                  <label htmlFor="phoneNumber" className={styles.label}>
                    เบอร์โทรศัพท์ <span className={styles.required}>*</span>
                  </label>
                  <PrimaryInputMask
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, phoneNumber: value }))
                    }
                    mask="9-9999-9999"
                    placeholder="0-XXXX-XXXX"
                    required
                    invalid={!!errors.phoneNumber}
                    errorMessage={errors.phoneNumber}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="mobilePhoneNumber" className={styles.label}>
                    เบอร์โทรศัพท์มือถือ{" "}
                    <span className={styles.required}>*</span>
                  </label>
                  <PrimaryInputMask
                    id="mobilePhoneNumber"
                    name="mobilePhoneNumber"
                    value={formData.mobilePhoneNumber}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        mobilePhoneNumber: value,
                      }))
                    }
                    mask="99-9999-9999"
                    placeholder="0X-XXXX-XXXX"
                    required
                    invalid={!!errors.mobilePhoneNumber}
                    errorMessage={errors.mobilePhoneNumber}
                  />
                </div>

                <div className={styles.termsSection}>
                  <div className={styles.termsWrapper}>
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className={styles.termsCheckbox}
                      onInvalid={(e) => {
                        (e.target as HTMLInputElement).setCustomValidity(
                          "กรุณายืนยันการยอมรับเงื่อนไขและข้อตกลงในการใช้งานระบบ"
                        );
                      }}
                      onChange={(e) => {
                        e.target.setCustomValidity("");
                      }}
                    />
                    <label htmlFor="terms" className={styles.termsLabel}>
                      ข้าพเจ้ายอมรับ{" "}
                      <button
                        type="button"
                        className={styles.termsLink}
                        onClick={() => {
                          // Open terms and conditions (to be implemented)
                          console.log("Open terms and conditions");
                        }}
                      >
                        เงื่อนไขและข้อตกลงการใช้งาน
                      </button>{" "}
                      ของระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
                      การยางแห่งประเทศไทย
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.navigationButtons}>
              {step > 1 ? (
                <PrimaryButton
                  type="button"
                  onClick={prevStep}
                  variant="outlined"
                  color="secondary"
                  icon="pi pi-chevron-left"
                  label="ย้อนกลับ"
                />
              ) : (
                <Link href="/">
                  <PrimaryButton
                    type="button"
                    variant="outlined"
                    color="secondary"
                    icon="pi pi-arrow-left"
                    label="กลับไปหน้าเข้าสู่ระบบ"
                  />
                </Link>
              )}

              {step < 4 ? (
                <PrimaryButton
                  type="button"
                  onClick={nextStep}
                  icon="pi pi-chevron-right"
                  iconPos="right"
                  label="ถัดไป"
                  color="success"
                />
              ) : (
                <PrimaryButton
                  type="submit"
                  loading={isLoading}
                  icon="pi pi-check"
                  label="ลงทะเบียน"
                  color="success"
                />
              )}
            </div>
          </form>
        </div>
        <p className={styles.footer}>
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/" className={styles.footerLink}>
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
