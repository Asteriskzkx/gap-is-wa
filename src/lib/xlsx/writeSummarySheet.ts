import ExcelJS from "exceljs";

type Column = {
  header: string;
  key: string;
  width?: number;
};

export async function writeSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  columns: Column[],
  rows: any[]
) {
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns;

  rows.forEach(row => sheet.addRow(row));

  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  return sheet;
}
