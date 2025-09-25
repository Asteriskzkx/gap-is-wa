export default function MenuIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={props?.className || "h-6 w-6"}
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}
