import React from "react";

type CheckIconProps = Readonly<React.SVGProps<SVGSVGElement>>;

export default function CheckIcon(props: CheckIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={props?.className || "h-6 w-6"}
      viewBox="0 -960 960 960"
      fill="currentColor"
      {...props}
    >
<path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
    </svg>
  );
}
