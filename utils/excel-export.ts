import ExcelJS from 'exceljs';
import moment from 'moment';
import { FORMAT_DATE } from '@/constants';

// Helper function to add image to cell
const addImageToCell = async (
  workbook: ExcelJS.Workbook,
  worksheet: ExcelJS.Worksheet,
  imageUrl: string | null | undefined,
  rowIndex: number,
  colIndex: number
) => {
  if (!imageUrl) return;

  try {
    // Fetch image as blob
    const response = await fetch(imageUrl);
    if (!response.ok) return;
    
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Add image to workbook
    const imageId = workbook.addImage({
      buffer: uint8Array as any,
      extension: 'png',
    });

    // Add image to worksheet with specific position and size
    worksheet.addImage(imageId, {
      tl: { col: colIndex, row: rowIndex } as any,
      br: { col: colIndex + 0.95, row: rowIndex + 0.95 } as any,
      editAs: 'oneCell',
    });
  } catch (error) {
    console.error('Error adding image to Excel:', error);
  }
};

const applyHeaderStyle = (worksheet: ExcelJS.Worksheet) => {
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF808080' }, // Gray background
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });


  worksheet.columns.forEach((column, colIndex) => {
    if (column) {
      let isEmpty = true;
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { 
          const cell = row.getCell(colIndex + 1);
          if (cell.value && cell.value !== '-') {
            isEmpty = false;
          }
        }
      });
      
  
      column.width = isEmpty ? 13.33 : 20;
    }
  });

  // Apply borders to all cells
  const borderStyle: Partial<ExcelJS.Border> = {
    style: 'thin',
    color: { argb: 'FF000000' }
  };

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: borderStyle,
        left: borderStyle,
        bottom: borderStyle,
        right: borderStyle
      };
      
      if (row.number > 1) {
        cell.font = { size: 11 };
      }
    });
  });
};

export const exportTrademarksToExcel = async (data: any[], companyMap: Record<string, string>) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Nhãn hiệu');

  worksheet.columns = [
    { header: 'Hình ảnh', key: 'image', width: 15 },
    { header: 'Nhãn hiệu', key: 'name' },
    { header: 'Số đơn', key: 'code' },
    { header: 'Ngày nộp đơn', key: 'application_date' },
    { header: 'Ngày công bố', key: 'publication_date' },
    { header: 'Số bằng', key: 'certificate_number' },
    { header: 'Ngày cấp', key: 'certificate_date' },
    { header: 'Chủ đơn/Chủ bằng', key: 'owner' },
    { header: 'Nhóm sản phẩm/Dịch vụ', key: 'nice_class_text' },
    { header: 'Trạng thái', key: 'status' },
  ];

  // Set row height for better image display
  worksheet.getRow(1).height = 20;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const rowIndex = i + 2; // Row 1 is header
    
    worksheet.addRow({
      image: '', // Empty cell for image
      name: item.name || '-',
      code: item.code || '-',
      application_date: item.application_date ? moment(item.application_date).format(FORMAT_DATE) : '-',
      publication_date: item.publication_date ? moment(item.publication_date).format(FORMAT_DATE) : '-',
      certificate_number: item.certificate_number || '-',
      certificate_date: item.certificate_date ? moment(item.certificate_date).format(FORMAT_DATE) : '-',
      owner: item.owner_name || '-',
      nice_class_text: (item as any).nice_class_text || '-',
      status: item.wipo_status || (item.certificate_number ? 'Cấp bằng' : 'Đang giải quyết'),
    });

    // Set row height for image
    worksheet.getRow(rowIndex).height = 60;

    // Add image if exists
    if (item.image_url) {
      await addImageToCell(workbook, worksheet, item.image_url, rowIndex - 1, 0);
    }
  }

  applyHeaderStyle(worksheet);

  const fileName = `Nhan_hieu_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const exportIndustrialDesignsToExcel = async (data: any[], companyMap: Record<string, string>) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Kiểu dáng công nghiệp');

  worksheet.columns = [
    { header: 'Hình ảnh', key: 'image', width: 15 },
    { header: 'Tên', key: 'name' },
    { header: 'Số đơn', key: 'application_number' },
    { header: 'Ngày nộp đơn', key: 'application_date' },
    { header: 'Ngày công bố', key: 'publication_date' },
    { header: 'Số bằng', key: 'certificate_number' },
    { header: 'Ngày cấp', key: 'certificate_date' },
    { header: 'Chủ đơn/Chủ bằng', key: 'owner' },
    { header: 'Trạng thái', key: 'status' },
  ];

  // Set row height for better image display
  worksheet.getRow(1).height = 20;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const rowIndex = i + 2;
    
    worksheet.addRow({
      image: '',
      name: item.name || '-',
      application_number: item.application_number || '-',
      application_date: item.application_date ? moment(item.application_date).format(FORMAT_DATE) : '-',
      publication_date: item.publication_date ? moment(item.publication_date).format(FORMAT_DATE) : '-',
      certificate_number: item.certificate_number || '-',
      certificate_date: item.certificate_date ? moment(item.certificate_date).format(FORMAT_DATE) : '-',
      owner: item.owner_name || '-',
      status: item.wipo_status || (item.certificate_number ? 'Cấp bằng' : 'Đang giải quyết'),
    });

    // Set row height for image
    worksheet.getRow(rowIndex).height = 60;

    // Add image if exists
    if (item.image_url) {
      await addImageToCell(workbook, worksheet, item.image_url, rowIndex - 1, 0);
    }
  }

  applyHeaderStyle(worksheet);

  const fileName = `Kieu_dang_cong_nghiep_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const exportPatentsToExcel = async (data: any[], companyMap: Record<string, string>) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sáng chế');

  worksheet.columns = [
    { header: 'Hình ảnh', key: 'image', width: 15 },
    { header: 'Tên sáng chế', key: 'name' },
    { header: 'Số đơn', key: 'application_number' },
    { header: 'Ngày nộp đơn', key: 'application_date' },
    { header: 'Ngày công bố', key: 'publication_date' },
    { header: 'Số bằng', key: 'certificate_number' },
    { header: 'Ngày cấp', key: 'certificate_date' },
    { header: 'Chủ đơn', key: 'owner' },
    { header: 'Phân loại IPC', key: 'ipc_list' },
    { header: 'Trạng thái', key: 'status' },
  ];

  // Set row height for better image display
  worksheet.getRow(1).height = 20;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const rowIndex = i + 2;
    
    worksheet.addRow({
      image: '',
      name: item.name || '-',
      application_number: item.application_number || '-',
      application_date: item.application_date ? moment(item.application_date).format(FORMAT_DATE) : '-',
      publication_date: item.publication_date ? moment(item.publication_date).format(FORMAT_DATE) : '-',
      certificate_number: item.certificate_number || '-',
      certificate_date: item.certificate_date ? moment(item.certificate_date).format(FORMAT_DATE) : '-',
      owner: item.owner_name || item.owner || '-',
      ipc_list: Array.isArray(item.ipc_list) ? item.ipc_list.join(', ') : (item.ipc_list || '-'),
      status: item.wipo_status || (item.certificate_number ? 'Cấp bằng' : 'Đang giải quyết'),
    });

    // Set row height for image
    worksheet.getRow(rowIndex).height = 60;

    // Add image if exists
    if (item.image_url) {
      await addImageToCell(workbook, worksheet, item.image_url, rowIndex - 1, 0);
    }
  }

  applyHeaderStyle(worksheet);

  const fileName = `Sang_che_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
};
