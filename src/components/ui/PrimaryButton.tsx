import { Button, ButtonProps } from "primereact/button";
import React from "react";

interface PrimaryButtonProps extends Omit<ButtonProps, "severity" | "size"> {
  readonly children?: React.ReactNode;
  readonly label?: string;
  readonly icon?: string; // PrimeIcons class name (e.g., "pi pi-check")
  readonly iconPos?: "left" | "right" | "top" | "bottom";
  readonly loading?: boolean;
  readonly fullWidth?: boolean;
  readonly variant?: "solid" | "outlined" | "text";
  readonly color?:
    | "success"
    | "danger"
    | "secondary"
    | "info"
    | "warning"
    | "help";
  readonly size?: "small" | "normal" | "large";
  readonly rounded?: boolean; // Rounded button (icon only)
  readonly text?: boolean; // Text button (no background)
  readonly tooltip?: string; // Tooltip text
  readonly tooltipOptions?: object; // Tooltip options
}

/**
 * PrimaryButton - ปุ่มหลักที่ใช้ในระบบ GAP
 *
 * @example
 * // ปุ่มสีเขียวแบบเต็ม
 * <PrimaryButton label="เข้าสู่ระบบ" loading={isLoading} fullWidth />
 *
 * // ปุ่มแบบ outlined
 * <PrimaryButton label="ยกเลิก" variant="outlined" color="secondary" />
 *
 * // ปุ่มพร้อม icon
 * <PrimaryButton label="บันทึก" icon="pi pi-check" color="success" />
 *
 * // ปุ่ม icon อย่างเดียว (rounded)
 * <PrimaryButton icon="pi pi-trash" color="danger" rounded text />
 */
export default function PrimaryButton({
  children,
  label,
  icon,
  iconPos = "left",
  loading = false,
  fullWidth = false,
  variant = "solid",
  color = "success",
  size = "large",
  className = "",
  disabled,
  rounded = false,
  text = false,
  tooltip,
  tooltipOptions,
  ...props
}: PrimaryButtonProps) {
  const getClassName = () => {
    const classes = [className];

    if (fullWidth) {
      classes.push("w-full");
    }

    return classes.join(" ").trim();
  };

  const getSeverity = (): ButtonProps["severity"] => {
    return color as ButtonProps["severity"];
  };

  const getSize = (): ButtonProps["size"] => {
    if (size === "normal") return undefined;
    return size as ButtonProps["size"];
  };

  return (
    <Button
      label={label || (typeof children === "string" ? children : undefined)}
      icon={icon}
      iconPos={iconPos}
      loading={loading}
      disabled={disabled || loading}
      severity={getSeverity()}
      outlined={variant === "outlined"}
      text={text || variant === "text"}
      rounded={rounded}
      size={getSize()}
      className={getClassName()}
      tooltip={tooltip}
      tooltipOptions={tooltipOptions}
      {...props}
    >
      {typeof children === "string" ? undefined : children}
    </Button>
  );
}
