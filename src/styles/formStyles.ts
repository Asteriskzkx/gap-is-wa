// CSS class constants for RubberFarm Registration Form
export const formStyles = {
  // Container styles
  container: "bg-white shadow-md rounded-lg p-6",
  formSection: "space-y-6",

  // Header styles
  header: {
    wrapper: "mb-6",
    title: "text-2xl font-bold text-gray-800 mb-2",
    description: "text-gray-600",
  },

  // Step indicator styles
  stepIndicator: {
    desktopWrapper: "hidden md:block",
    mobileWrapper: "md:hidden",
    stepContainer: "flex items-center",
    stepCircle: {
      base: "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
      active: "bg-green-600 text-white ring-4 ring-green-100",
      completed: "bg-green-600 text-white",
      inactive: "bg-gray-300 text-gray-600",
    },
    stepLabel: {
      base: "text-sm transition-all duration-300",
      active: "text-green-600 font-semibold",
      completed: "text-green-600",
      inactive: "text-gray-500",
    },
    progressLine: {
      base: "flex-1 mx-4 mb-6",
      bar: "h-1 rounded-full transition-all duration-300",
      completed: "bg-green-600",
      inactive: "bg-gray-300",
    },
    mobileCircle: {
      base: "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
      active: "bg-green-600 text-white ring-2 ring-green-100",
      completed: "bg-green-600 text-white",
      inactive: "bg-gray-300 text-gray-600",
    },
    mobileProgressLine: {
      completed: "w-8 h-0.5 bg-green-600 transition-all duration-300",
      inactive: "w-8 h-0.5 bg-gray-300 transition-all duration-300",
    },
  },

  // Alert styles
  alert: {
    error:
      "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6",
    success:
      "bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6",
    warning:
      "text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-3",
  },

  // Form field styles
  formField: {
    wrapper: "grid grid-cols-1 sm:grid-cols-2 gap-6",
    wrapperThree: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
    label: "block text-sm font-medium text-gray-700 mb-1",
    requiredMark: "text-red-500 ml-1",
    hint: "text-sm text-gray-500 mb-3",
  },

  // Section styles
  section: {
    title: "text-xl font-semibold text-gray-800 border-b pb-2",
    card: "p-4 border border-gray-200 rounded-md mb-4",
    cardTitle: "font-medium text-gray-800 mb-3",
    summaryCard: "p-4 bg-gray-50 rounded-md mb-6",
    summaryTitle: "font-medium text-gray-800 mb-3",
    summaryGrid: "grid grid-cols-1 sm:grid-cols-2 gap-4",
    summaryDetailGrid: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4",
    summaryItem: {
      label: "text-sm text-gray-600",
      value: "text-base text-gray-900",
    },
  },

  // Map container
  mapContainer: {
    wrapper: "mt-6 mb-8 w-full",
    container: "w-full",
  },

  // Navigation buttons
  navigation: {
    wrapper: "mt-8 flex justify-between",
  },

  // Checkbox styles
  checkbox: {
    wrapper: "flex items-center mb-4",
    input:
      "h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded",
    label: "ml-2 text-sm text-gray-700",
  },
};
