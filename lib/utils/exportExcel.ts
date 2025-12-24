import ExcelJS from "exceljs";

export interface ExportData {
  sheetName: string;
  columns: { header: string; key: string; width?: number }[];
  data: any[];
}

export const exportToExcel = async (
  fileName: string,
  exportData: ExportData[]
) => {
  const workbook = new ExcelJS.Workbook();

  exportData.forEach(({ sheetName, columns, data }) => {
    const worksheet = workbook.addWorksheet(sheetName);

    // Add columns
    worksheet.columns = columns;

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Add data
    data.forEach((row) => {
      worksheet.addRow(row);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (!column.width) {
        const maxLength = Math.max(
          column.header?.length || 0,
          ...data.map((row) => String(row[column.key || ""] || "").length)
        );
        column.width = Math.min(Math.max(maxLength + 2, 10), 50);
      }
    });
  });

  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};
