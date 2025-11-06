// Utility function to format Thai dates
export const formatThaiDate = (
  dateString: string | null,
  format: "year" | "month" | "full" = "full"
): string => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (format === "year") {
    return date.toLocaleDateString("th-TH", { year: "numeric" });
  } else if (format === "month") {
    return date.toLocaleDateString("th-TH", { month: "long" });
  } else {
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
};
