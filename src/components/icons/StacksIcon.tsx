import React from "react";

type StacksIconProps = Readonly<React.SVGProps<SVGSVGElement>>;

export default function StacksIcon(props: StacksIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={props?.className || "h-6 w-6"}
      viewBox="0 -960 960 960"
      fill="currentColor"
      {...props}
    >
      <path d="M480-400 40-640l440-240 440 240-440 240Zm0 160L63-467l84-46 333 182 333-182 84 46-417 227Zm0 160L63-307l84-46 333 182 333-182 84 46L480-80Zm0-411 273-149-273-149-273 149 273 149Zm0-149Z" />
    </svg>
  );
}
