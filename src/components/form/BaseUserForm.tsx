"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

export type BaseUserFormValues = {
  namePrefix: string;
  firstName: string;
  lastName: string;
  email: string;
};

type Option = { name: string; value: string };

type BaseUserFormProps = {
  defaultValues: BaseUserFormValues;
  onSubmit: (values: BaseUserFormValues) => Promise<void>;
  namePrefixOptions?: Option[];
  submitLabel?: string;
  resetLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  externalDirty?: boolean;
  onResetExternal?: () => void;
};

export default function BaseUserForm({
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
}: BaseUserFormProps) {
  const toast = useRef<Toast | null>(null);
  const [formData, setFormData] = useState<BaseUserFormValues>(defaultValues);
  const [submitting, setSubmitting] = useState(false);

  const prefixOptions: Option[] =
    namePrefixOptions ?? [
      { name: "นาย", value: "นาย" },
      { name: "นางสาว", value: "นางสาว" },
      { name: "นาง", value: "นาง" },
    ];

  const initialFormData = useMemo(() => ({ ...defaultValues }), [defaultValues]);

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

  const handleChange = (e: any) => {
    const name = e.target?.name;
    const value = e.value ?? e.target?.value;
    if (!name) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(formData);
      toast.current?.show({
        severity: "success",
        summary: "สำเร็จ",
        detail: successMessage,
        life: 3000,
      });
    } catch (err: any) {
      const detail = err?.message || errorMessage;
      toast.current?.show({
        severity: "error",
        summary: "ไม่สำเร็จ",
        detail,
        life: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-4">
        <div className="w-full items-center gap-4">
          <label htmlFor="namePrefix" className="w-28">
            คำนำหน้า <span className="text-red-500">*</span>
          </label>
          <Dropdown
            inputId="namePrefix"
            name="namePrefix"
            value={formData.namePrefix}
            onChange={handleChange}
            options={prefixOptions}
            optionLabel="name"
            optionValue="value"
            className="w-full"
            placeholder="คำนำหน้า"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <div className="w-full items-center gap-4">
            <label htmlFor="firstName" className="w-28">
              ชื่อ <span className="text-red-500">*</span>
            </label>
            <InputText
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full"
              placeholder="ชื่อ"
            />
          </div>

          <div className="w-full items-center gap-4">
            <label htmlFor="lastName" className="w-28">
              นามสกุล <span className="text-red-500">*</span>
            </label>
            <InputText
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full"
              placeholder="นามสกุล"
            />
          </div>
        </div>

        <div className="w-full items-center gap-4">
          <label htmlFor="email" className="w-28">
            อีเมล <span className="text-red-500">*</span>
          </label>
          <InputText
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full"
            placeholder="อีเมล"
          />
        </div>

        {children}

        <div className="flex gap-4 mt-4 inset-0 w-full justify-end">
          <Button
            type="submit"
            label={submitLabel}
            icon="pi pi-save"
            className="px-3 py-2"
            severity="success"
            disabled={!isAnyDirty || submitting || disabled}
          />
          <Button
            type="reset"
            label={resetLabel}
            icon="pi pi-times"
            className="px-3 py-2"
            severity="danger"
            disabled={!isAnyDirty || submitting || disabled}
          />
        </div>
      </form>
    </>
  );
}