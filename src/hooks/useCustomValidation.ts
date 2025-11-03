import { useEffect, RefObject } from "react";

/**
 * Type for form input elements
 */
type FormInput = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/**
 * Validation message structure
 */
interface ValidationMessages {
  valueMissing?: string;
  typeMismatch?: string;
  patternMismatch?: string;
  tooShort?: string;
  tooLong?: string;
  rangeUnderflow?: string;
  rangeOverflow?: string;
  stepMismatch?: string;
  badInput?: string;
}

/**
 * Custom validation messages in Thai
 */
const validationMessages: Record<string, ValidationMessages> = {
  email: {
    valueMissing: "กรุณากรอกอีเมล",
    typeMismatch: "กรุณากรอกอีเมลให้ถูกต้อง เช่น example@email.com",
    patternMismatch: "รูปแบบอีเมลไม่ถูกต้อง",
  },
  password: {
    valueMissing: "กรุณากรอกรหัสผ่าน",
    tooShort: "รหัสผ่านต้องมีอย่างน้อย {minLength} ตัวอักษร",
  },
  text: {
    valueMissing: "กรุณากรอกข้อมูลในช่องนี้",
    tooShort: "ข้อมูลต้องมีอย่างน้อย {minLength} ตัวอักษร",
    tooLong: "ข้อมูลต้องไม่เกิน {maxLength} ตัวอักษร",
    patternMismatch: "รูปแบบข้อมูลไม่ถูกต้อง",
  },
  number: {
    valueMissing: "กรุณากรอกตัวเลข",
    rangeUnderflow: "ค่าต้องมากกว่าหรือเท่ากับ {min}",
    rangeOverflow: "ค่าต้องน้อยกว่าหรือเท่ากับ {max}",
    stepMismatch: "กรุณากรอกค่าที่ถูกต้อง",
  },
  tel: {
    valueMissing: "กรุณากรอกเบอร์โทรศัพท์",
    patternMismatch: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง",
  },
  url: {
    valueMissing: "กรุณากรอก URL",
    typeMismatch: "กรุณากรอก URL ให้ถูกต้อง เช่น https://example.com",
  },
  date: {
    valueMissing: "กรุณาเลือกวันที่",
    rangeUnderflow: "วันที่ต้องไม่น้อยกว่า {min}",
    rangeOverflow: "วันที่ต้องไม่เกิน {max}",
  },
  default: {
    valueMissing: "กรุณากรอกข้อมูล",
    typeMismatch: "รูปแบบข้อมูลไม่ถูกต้อง",
    patternMismatch: "รูปแบบข้อมูลไม่ถูกต้อง",
    tooLong: "ข้อมูลยาวเกินไป",
    tooShort: "ข้อมูลสั้นเกินไป",
    rangeUnderflow: "ค่าน้อยเกินไป",
    rangeOverflow: "ค่ามากเกินไป",
    stepMismatch: "ค่าไม่ถูกต้อง",
    badInput: "ข้อมูลไม่ถูกต้อง",
  },
};

/**
 * Get custom validation message based on input type and validity state
 */
function getValidationMessage(input: FormInput): string {
  const validity = input.validity;
  const type = input.type || "text";
  const messages = validationMessages[type] || validationMessages.default;
  const defaultMsg = validationMessages.default;

  // Check each validation state
  if (validity.valueMissing) {
    return messages.valueMissing || defaultMsg.valueMissing || "";
  }

  if (validity.typeMismatch) {
    return messages.typeMismatch || defaultMsg.typeMismatch || "";
  }

  if (validity.patternMismatch) {
    return messages.patternMismatch || defaultMsg.patternMismatch || "";
  }

  if (validity.tooShort) {
    const minLength = input.getAttribute("minlength") || "";
    return (
      messages.tooShort?.replace("{minLength}", minLength) ||
      defaultMsg.tooShort ||
      ""
    );
  }

  if (validity.tooLong) {
    const maxLength = input.getAttribute("maxlength") || "";
    return (
      messages.tooLong?.replace("{maxLength}", maxLength) ||
      defaultMsg.tooLong ||
      ""
    );
  }

  if (validity.rangeUnderflow) {
    const min = input.getAttribute("min") || "";
    return (
      messages.rangeUnderflow?.replace("{min}", min) ||
      defaultMsg.rangeUnderflow ||
      ""
    );
  }

  if (validity.rangeOverflow) {
    const max = input.getAttribute("max") || "";
    return (
      messages.rangeOverflow?.replace("{max}", max) ||
      defaultMsg.rangeOverflow ||
      ""
    );
  }

  if (validity.stepMismatch) {
    return messages.stepMismatch || defaultMsg.stepMismatch || "";
  }

  if (validity.badInput) {
    return messages.badInput || defaultMsg.badInput || "";
  }

  return input.validationMessage;
}

/**
 * Hook to apply custom validation messages to form inputs
 * @param formRef - Reference to the form element
 */
export function useCustomValidation(formRef: RefObject<HTMLFormElement>) {
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const inputs = form.querySelectorAll<FormInput>("input, textarea, select");

    const handleInvalid = (e: Event) => {
      e.preventDefault();
      const input = e.target as FormInput;
      const message = getValidationMessage(input);
      input.setCustomValidity(message);
    };

    const handleInput = (e: Event) => {
      const input = e.target as FormInput;
      input.setCustomValidity("");
    };

    // Add event listeners to all form inputs
    Array.from(inputs).forEach((input) => {
      input.addEventListener("invalid", handleInvalid);
      input.addEventListener("input", handleInput);
    });

    // Cleanup
    return () => {
      Array.from(inputs).forEach((input) => {
        input.removeEventListener("invalid", handleInvalid);
        input.removeEventListener("input", handleInput);
      });
    };
  }, [formRef]);
}

/**
 * Export validation messages for direct use if needed
 */
export { validationMessages, getValidationMessage };
