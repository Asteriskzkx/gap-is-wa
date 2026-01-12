"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  PrimaryButton,
  PrimaryDropdown,
  PrimaryInputText,
} from "@/components/ui";

export type BaseUserFormValues = {
  namePrefix: string;
  firstName: string;
  lastName: string;
  email: string;
};

type Option = { name: string; value: string };

type BaseUserFormProps<T = any> = {
  defaultValues: BaseUserFormValues;
  onSubmit: (values: BaseUserFormValues) => Promise<T>;
  namePrefixOptions?: Option[];
  submitLabel?: string;
  resetLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  externalDirty?: boolean;
  onResetExternal?: () => void;
  onSuccess?: (data: T) => void;
};

export default function BaseUserForm<T = any>({
  defaultValues,
  onSubmit,
  namePrefixOptions,
  submitLabel = "บันทึก",
  resetLabel = "รีเซ็ต",
  successMessage = "บันทึกข้อมูลเรียบร้อย",
  errorMessage = "บันทึกไม่สำเร็จ",
  disabled = false,
  children,
  externalDirty = false,
  onResetExternal,
  onSuccess,
}: Readonly<BaseUserFormProps<T>>) {
  const router = useRouter();
  const [formData, setFormData] = useState<BaseUserFormValues>(defaultValues);
  const [submitting, setSubmitting] = useState(false);

  const prefixOptions: Option[] = namePrefixOptions ?? [
    { name: "นาย", value: "นาย" },
    { name: "นางสาว", value: "นางสาว" },
    { name: "นาง", value: "นาง" },
  ];

  const initialFormData = useMemo(
    () => ({ ...defaultValues }),
    [defaultValues]
  );

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const isDirty = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(initialFormData),
    [formData, initialFormData]
  );

  const isAnyDirty = isDirty || externalDirty;

  const handleReset = () => {
    setFormData(initialFormData);
    onResetExternal?.();
  };

  const setField = (name: keyof BaseUserFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || submitting) return;
    setSubmitting(true);
    try {
      const result = await onSubmit(formData);
      toast.success(successMessage);
      onSuccess?.(result);
    } catch (err: any) {
      const detail = err?.message || errorMessage;
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-4">
      <div className="w-full items-center gap-4">
        <label htmlFor="namePrefix" className="w-28">
          คำนำหน้า <span className="text-red-500">*</span>
        </label>
        <PrimaryDropdown
          id="namePrefix"
          name="namePrefix"
          value={formData.namePrefix}
          onChange={(value) => setField("namePrefix", value ?? "")}
          options={prefixOptions.map((o) => ({
            label: o.name,
            value: o.value,
          }))}
          placeholder="คำนำหน้า"
          required
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
        <div className="w-full items-center gap-4">
          <label htmlFor="firstName" className="w-28">
            ชื่อ <span className="text-red-500">*</span>
          </label>
          <PrimaryInputText
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={(value) => setField("firstName", value)}
            className="w-full"
            placeholder="ชื่อ"
            maxLength={100}
            required
          />
        </div>

        <div className="w-full items-center gap-4">
          <label htmlFor="lastName" className="w-28">
            นามสกุล <span className="text-red-500">*</span>
          </label>
          <PrimaryInputText
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={(value) => setField("lastName", value)}
            className="w-full"
            placeholder="นามสกุล"
            maxLength={100}
            required
          />
        </div>
      </div>

      <div className="w-full items-center gap-4">
        <label htmlFor="email" className="w-28">
          อีเมล <span className="text-red-500">*</span>
        </label>
        <PrimaryInputText
          id="email"
          name="email"
          value={formData.email}
          onChange={(value) => setField("email", value)}
          className="w-full"
          placeholder="อีเมล"
          maxLength={100}
          required
        />
      </div>

      {children}

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4 md:items-center">
        <PrimaryButton
          type="button"
          label="ย้อนกลับ"
          icon="pi pi-arrow-left"
          color="secondary"
          variant="outlined"
          className="w-full md:w-auto md:justify-self-start"
          disabled={submitting || disabled}
          onClick={() => router.back()}
        />

        <PrimaryButton
          type="submit"
          label={submitLabel}
          icon="pi pi-save"
          color="success"
          className="w-full md:w-auto md:col-start-3 md:justify-self-end"
          disabled={!isAnyDirty || submitting || disabled}
        />

        <PrimaryButton
          type="reset"
          label={resetLabel}
          icon="pi pi-times"
          color="danger"
          className="w-full md:w-auto md:col-start-4 md:justify-self-end"
          disabled={!isAnyDirty || submitting || disabled}
        />
      </div>
    </form>
  );
}
