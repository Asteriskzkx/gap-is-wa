/**
 * CSS Class Name Constants for Auditor Pages
 * Centralized styling constants for consistency across the application
 */

// Container & Layout Classes
export const CONTAINER = {
  page: "w-full px-4 sm:px-6 lg:px-8 py-8",
  card: "bg-white rounded-lg shadow-sm overflow-hidden",
  cardPadding: "p-4 sm:p-6",
  section: "mb-8",
  loading: "flex justify-center items-center min-h-screen",
  loadingMinHeight: "flex justify-center items-center min-h-[60vh]",
} as const;

// Header Classes
export const HEADER = {
  title: "text-2xl font-bold text-gray-900",
  subtitle: "mt-1 text-sm text-gray-500",
} as const;

// Button & Input Classes
export const FORM = {
  searchWrapper: "w-full sm:max-w-xs",
  searchIcon: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400",
  searchInput: "pl-10",
  buttonGroup: "flex gap-2",
  inputGroup: "relative",
} as const;

// Table Classes
export const TABLE = {
  wrapper: "hidden md:block overflow-x-auto",
  table: "min-w-full divide-y divide-gray-200",
  thead: "bg-gray-50",
  tbody: "bg-white divide-y divide-gray-200",
  th: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
  thCenter:
    "px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider",
  td: "px-4 py-3 whitespace-nowrap text-sm text-gray-900",
  tdCenter: "px-4 py-3 whitespace-nowrap text-center text-sm",
  row: "hover:bg-gray-50",
} as const;

// Card Classes (Mobile)
export const CARD = {
  wrapper: "md:hidden space-y-4",
  item: "bg-white rounded-lg shadow-sm p-4 border border-gray-100",
  header: "flex justify-between items-start mb-2",
  title: "text-sm font-medium text-gray-900",
  content: "mt-3",
  label: "text-sm font-medium",
  value: "font-normal text-gray-900",
  valueSecondary: "font-normal text-gray-600",
  footer: "mt-4 flex justify-end",
  hint: "text-center text-xs text-gray-500 italic mt-2",
} as const;

// Status Badge Classes
export const BADGE = {
  base: "inline-flex items-center px-3 py-1 text-xs font-medium rounded-full",
  wrapper: "inline-flex justify-center w-full",
  yellow: "bg-yellow-100 text-yellow-800",
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-gray-100 text-gray-800",
} as const;

// Text Classes
export const TEXT = {
  primary: "text-gray-900",
  secondary: "text-gray-600",
  tertiary: "text-gray-500",
  muted: "text-gray-400",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  sm: "text-sm",
  smMedium: "text-sm font-medium text-gray-700",
  smTertiary: "text-sm text-gray-500",
  lgMedium: "text-lg font-medium text-gray-900",
  xlSemibold: "text-xl font-semibold",
  mdSemibold: "text-md font-semibold text-gray-800",
} as const;

// Spacing Classes
export const SPACING = {
  gap2: "gap-2",
  gap4: "gap-4",
  mb2: "mb-2",
  mb3: "mb-3",
  mb4: "mb-4",
  mb6: "mb-6",
  mb8: "mb-8",
  mt1: "mt-1",
  mt2: "mt-2",
  mt3: "mt-3",
  mt4: "mt-4",
  mt8: "mt-8",
  mr1: "mr-1",
  mr2: "mr-2",
  p3: "p-3",
  p4: "p-4",
  p6: "p-6",
  px4: "px-4",
  py2: "py-2",
  py3: "py-3",
} as const;

// Grid & Flex Classes
export const LAYOUT = {
  flexCol: "flex flex-col",
  flexRow: "flex flex-row",
  flexBetween: "flex justify-between items-center",
  flexCenter: "flex justify-center items-center",
  grid: "grid grid-cols-1",
  gridMd2: "grid grid-cols-1 md:grid-cols-2",
  gap4: "gap-4",
} as const;

// Info Card Classes
export const INFO_CARD = {
  wrapper: "bg-gray-50 p-3 rounded-lg",
  label: "text-sm text-gray-500",
  value: "font-medium",
  valueGray: "font-normal text-gray-600",
  section: "border-b pb-4 mb-4",
  title: "text-xl font-semibold",
  titleLarge: "text-2xl font-bold text-gray-900",
  sectionBorder: "border-b pb-4 mb-4",
  sectionTitle: "text-xl font-semibold mb-4",
} as const;

// Input & Form Field Classes
export const FIELD = {
  wrapper: "mb-6 p-4 bg-gray-50 rounded-lg",
  label: "block text-sm font-medium text-gray-700 mb-1",
  labelMb2: "block text-sm font-medium text-gray-700 mb-2",
  input:
    "w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700",
  inputTextArea:
    "w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 min-h-[80px]",
  checkbox:
    "h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded",
  checkboxLabel: "ml-2 block text-sm text-gray-900",
  spaceY: "space-y-3",
  title: "text-md font-semibold text-gray-800 mb-3",
} as const;

// Loading Spinner
export const SPINNER = {
  wrapper: "text-center py-12",
  spinner:
    "animate-spin rounded-full h-12 w-12 border-b-2 border-green-900 mx-auto",
  spinnerSmall: "animate-spin rounded-full h-8 w-8 border-b-2 border-green-600",
  text: "mt-3 text-sm text-gray-500",
} as const;

// Empty State
export const EMPTY = {
  wrapper: "text-center py-12",
  icon: "mx-auto h-12 w-12 text-gray-400",
  message: "mt-2 text-sm text-gray-500",
} as const;

// Action Button Classes
export const ACTION = {
  button: "text-indigo-600 hover:text-indigo-900 text-sm font-medium",
  buttonPrimary:
    "py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500",
  buttonSecondary:
    "py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500",
  buttonBack:
    "inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none",
  buttonDisabled: "disabled:opacity-50",
} as const;

// GRID Classes
export const GRID = {
  cols1: "grid grid-cols-1",
  cols2: "grid grid-cols-1 sm:grid-cols-2",
  cols2Md: "grid grid-cols-1 md:grid-cols-2",
  cols3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  gap4: "gap-4",
  gap4Mt4: "gap-4 mt-4",
} as const;

// Flex Classes
export const FLEX = {
  center: "flex justify-center items-center",
  between: "flex justify-between items-start",
  betweenCenter: "flex justify-between items-center",
  itemsCenter: "flex items-center",
  itemsStart: "flex items-start",
  colCenter: "flex flex-col items-center",
  gap2: "flex gap-2",
  justifyCenter: "flex justify-center",
  justifyCenterGap2: "flex justify-center gap-2",
  spaceX12: "flex justify-center space-x-12",
  spaceY4: "space-y-4",
  shrink0: "flex-shrink-0",
} as const;

// Requirements & List Item Classes
export const REQ = {
  card: "p-4 border rounded-md bg-gray-50",
  cardMb2: "mb-2",
  title: "ml-2 text-md font-medium text-gray-900",
  grid: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4",
  spaceY: "mb-6 space-y-4",
} as const;

// Utility function to combine classes
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
