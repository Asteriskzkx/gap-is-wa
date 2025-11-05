import { useState, useCallback } from "react";

export interface ValidationRule<T = any> {
  required?: boolean | string; // true or custom message
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  custom?: (value: T) => string | undefined; // return error message or undefined
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface UseFormValidationReturn<T> {
  errors: Partial<Record<keyof T, string>>;
  validate: (fieldName: keyof T, value: any, schema?: ValidationRule) => string;
  validateAll: (data: T, schema: ValidationSchema) => boolean;
  setError: (fieldName: keyof T, message: string) => void;
  clearError: (fieldName: keyof T) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}

/**
 * Custom hook สำหรับจัดการ form validation
 *
 * @example
 * const { errors, validate, validateAll } = useFormValidation<FormData>();
 *
 * // Validate single field
 * const emailError = validate("email", formData.email, {
 *   required: true,
 *   pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "รูปแบบอีเมลไม่ถูกต้อง" }
 * });
 *
 * // Validate all fields
 * const isValid = validateAll(formData, validationSchema);
 */
export function useFormValidation<
  T extends Record<string, any>
>(): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validate = useCallback(
    (fieldName: keyof T, value: any, schema?: ValidationRule): string => {
      if (!schema) return "";

      // Required validation
      if (schema.required) {
        const isEmpty =
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
          const message =
            typeof schema.required === "string"
              ? schema.required
              : `กรุณากรอก${String(fieldName)}`;
          return message;
        }
      }

      // Skip other validations if value is empty and not required
      if (
        !schema.required &&
        (value === undefined || value === null || value === "")
      ) {
        return "";
      }

      // MinLength validation
      if (schema.minLength && typeof value === "string") {
        if (value.length < schema.minLength.value) {
          return schema.minLength.message;
        }
      }

      // MaxLength validation
      if (schema.maxLength && typeof value === "string") {
        if (value.length > schema.maxLength.value) {
          return schema.maxLength.message;
        }
      }

      // Pattern validation
      if (schema.pattern && typeof value === "string") {
        if (!schema.pattern.value.test(value)) {
          return schema.pattern.message;
        }
      }

      // Custom validation
      if (schema.custom) {
        const customError = schema.custom(value);
        if (customError) {
          return customError;
        }
      }

      return "";
    },
    []
  );

  const validateAll = useCallback(
    (data: T, schema: ValidationSchema): boolean => {
      const newErrors: Partial<Record<keyof T, string>> = {};
      let isValid = true;

      Object.keys(schema).forEach((fieldName) => {
        const error = validate(
          fieldName as keyof T,
          data[fieldName],
          schema[fieldName]
        );
        if (error) {
          newErrors[fieldName as keyof T] = error;
          isValid = false;
        }
      });

      setErrors(newErrors);
      return isValid;
    },
    [validate]
  );

  const setError = useCallback((fieldName: keyof T, message: string) => {
    setErrors((prev) => ({ ...prev, [fieldName]: message }));
  }, []);

  const clearError = useCallback((fieldName: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    validate,
    validateAll,
    setError,
    clearError,
    clearAllErrors,
    hasErrors,
  };
}
