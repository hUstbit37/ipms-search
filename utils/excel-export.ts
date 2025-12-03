import ExcelJS from 'exceljs';
import moment from 'moment';
import { FORMAT_DATE } from '@/constants';

const applyHeaderStyle = (worksheet: ExcelJS.Worksheet) => {
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, size: 11 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFC4D79B' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
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

  data.forEach((item) => {
    worksheet.addRow({
      name: item.name || '-',
      code: item.code || '-',
      application_date: item.application_date ? moment(item.application_date).format(FORMAT_DATE) : '-',
      publication_date: item.publication_date ? moment(item.publication_date).format(FORMAT_DATE) : '-',
      certificate_number: item.certificate_number || '-',
      certificate_date: item.certificate_date ? moment(item.certificate_date).format(FORMAT_DATE) : '-',
      owner: item.owner_id ? (companyMap[item.owner_id] || '-') : '-',
      nice_class_text: (item as any).nice_class_text || '-',
      status: item.wipo_status || (item.certificate_number ? 'Cấp bằng' : 'Đang giải quyết'),
    });
  });

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
    { header: 'Tên', key: 'name' },
    { header: 'Số đơn', key: 'application_number' },
    { header: 'Ngày nộp đơn', key: 'application_date' },
    { header: 'Ngày công bố', key: 'publication_date' },
    { header: 'Số bằng', key: 'certificate_number' },
    { header: 'Ngày cấp', key: 'certificate_date' },
    { header: 'Chủ đơn/Chủ bằng', key: 'owner' },
    { header: 'Trạng thái', key: 'status' },
  ];

  data.forEach((item) => {
    worksheet.addRow({
      name: item.name || '-',
      application_number: item.application_number || '-',
      application_date: item.application_date ? moment(item.application_date).format(FORMAT_DATE) : '-',
      publication_date: item.publication_date ? moment(item.publication_date).format(FORMAT_DATE) : '-',
      certificate_number: item.certificate_number || '-',
      certificate_date: item.certificate_date ? moment(item.certificate_date).format(FORMAT_DATE) : '-',
      owner: (item as any).owner_id ? (companyMap[(item as any).owner_id] || '-') : '-',
      status: item.wipo_status || (item.certificate_number ? 'Cấp bằng' : 'Đang giải quyết'),
    });
  });

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

  data.forEach((item) => {
    worksheet.addRow({
      name: item.name || '-',
      application_number: item.application_number || '-',
      application_date: item.application_date ? moment(item.application_date).format(FORMAT_DATE) : '-',
      publication_date: item.publication_date ? moment(item.publication_date).format(FORMAT_DATE) : '-',
      certificate_number: item.certificate_number || '-',
      certificate_date: item.certificate_date ? moment(item.certificate_date).format(FORMAT_DATE) : '-',
      owner: item.owner_id ? (companyMap[item.owner_id] || '-') : '-',
      ipc_list: item.ipc_list || '-',
      status: item.wipo_status || (item.certificate_number ? 'Cấp bằng' : 'Đang giải quyết'),
    });
  });

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
