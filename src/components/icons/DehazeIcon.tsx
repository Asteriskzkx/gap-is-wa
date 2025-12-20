import React from "react";

type DehazeIconProps = Readonly<React.SVGProps<SVGSVGElement>>;

export default function DehazeIcon(props: DehazeIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={props?.className || "h-6 w-6"}
      viewBox="0 -960 960 960"
      fill="currentColor"
      {...props}
    >
<path d="M120-680v-80h720v80H120Zm0 480v-80h720v80H120Zm0-240v-80h720v80H120Z"/>
    </svg>
  );
}
