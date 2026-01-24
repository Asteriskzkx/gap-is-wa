import ExcelJS from "exceljs";

export function createWorkbook(title?: string) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "GAP Rubber System";
  workbook.created = new Date();

  if (title) {
    workbook.title = title;
  }

  return workbook;
}