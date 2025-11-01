export default function PlusIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={props?.className || "h-6 w-6"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}