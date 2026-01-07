"use client";

import { PrimaryInputText, PrimaryPassword } from "@/components/ui";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useLoginForm } from "@/hooks/useLoginForm";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import styles from "./login.module.css";

export default function LoginPage() {
  const {
    email,
    password,
    selectedRole,
    isLoading,
    error,
    emailError,
    passwordError,
    setEmail,
    setPassword,
    setSelectedRole,
    handleSubmit,
    validateEmail,
    validatePassword,
  } = useLoginForm();

  return (
    <div className={styles.loginContainer}>
      {/* Left side - image (hidden on mobile) */}
      <div className={styles.imageSection}>
        <div className={styles.imageWrapper}>
          <Image
            src="/rubber-tapping.jpg"
            alt="การยางแห่งประเทศไทย"
            className={styles.heroImage}
            width={600}
            height={800}
            priority
          />
          <div className={styles.imageCaption}>
            <h3 className={styles.captionTitle}>
              ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
            </h3>
            <p className={styles.captionSubtitle}>การยางแห่งประเทศไทย</p>
          </div>
        </div>
      </div>

      {/* Right side - login form */}
      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <div className={styles.logoWrapper}>
              <Image
                src="/logo-with-text.png"
                alt="Rubber Authority of Thailand Logo"
                width={120}
                height={120}
                priority
              />
            </div>
            <h1 className={styles.title}>เข้าสู่ระบบ</h1>
            <p className={styles.subtitle}>
              ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
            </p>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="role" className={styles.label}>
                เข้าสู่ระบบในฐานะ
              </label>
              <div className={styles.roleGrid}>
                {[
                  { id: "FARMER", label: "เกษตรกร" },
                  { id: "AUDITOR", label: "ผู้ตรวจประเมิน" },
                  { id: "COMMITTEE", label: "คณะกรรมการ" },
                  { id: "ADMIN", label: "ผู้ดูแลระบบ" },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    className={`${styles.roleButton} ${
                      selectedRole === role.id
                        ? styles.roleButtonActive
                        : styles.roleButtonInactive
                    }`}
                    onClick={() => setSelectedRole(role.id as any)}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                อีเมล
              </label>
              <PrimaryInputText
                id="email"
                name="email"
                type="text"
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  if (emailError) validateEmail(value);
                }}
                placeholder="email@example.com"
                autoComplete="email"
                invalid={!!emailError}
                errorMessage={emailError}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                รหัสผ่าน
              </label>
              <PrimaryPassword
                id="password"
                name="password"
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  if (passwordError) validatePassword(value);
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                feedback={false}
                toggleMask={true}
                invalid={!!passwordError}
                errorMessage={passwordError}
              />
            </div>

            <div className={styles.submitButton}>
              <PrimaryButton
                type="submit"
                label="เข้าสู่ระบบ"
                loading={isLoading}
                disabled={isLoading}
                fullWidth
              />
            </div>
          </form>

          <div className={styles.footer}>
            <p
              className={`${styles.registerPrompt} ${
                selectedRole === "FARMER" ? "" : styles.registerPromptHidden
              }`}
            >
              ยังไม่มีบัญชีผู้ใช้?{" "}
              <Link href="/register" className={styles.registerLink}>
                สมัครสมาชิกใหม่
              </Link>
            </p>
            <p className={styles.copyright}>
              &copy; {new Date().getFullYear()} การยางแห่งประเทศไทย.
              สงวนลิขสิทธิ์.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
