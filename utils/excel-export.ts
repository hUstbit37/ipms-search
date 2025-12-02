import * as XLSX from 'xlsx';
import moment from 'moment';
import { FORMAT_DATE } from '@/constants';

export const exportTrademarksToExcel = (data: any[], companyMap: Record<string, string>) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((item) => ({
      'Nhãn hiệu': item.name || '-',
      'Số đơn': item.code || '-',
      'Ngày nộp đơn': item.application_date ? moment(item.application_date).format(FORMAT_DATE) : '-',
      'Ngày công bố': item.publication_date ? moment(item.publication_date).format(FORMAT_DATE) : '-',
      'Số bằng': item.certificate_number || '-',
      'Ngày cấp': item.certificate_date ? moment(item.certificate_date).format(FORMAT_DATE) : '-',
      'Chủ đơn/Chủ bằng': item.owner_id ? (companyMap[item.owner_id] || '-') : '-',
      'Nhóm sản phẩm/Dịch vụ': (item as any).nice_class_text || '-',
      'Trạng thái': item.wipo_status || (item.certificate_number ? 'Cấp bằng' : 'Đang giải quyết'),
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nhãn hiệu');

  const fileName = `Nhan_hieu_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportIndustrialDesignsToExcel = (data: any[], companyMap: Record<string, string>) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((item) => ({
      'Tên': item.name || '-',
      'Số đơn': item.application_number || '-',
      'Ngày nộp đơn': item.application_date ? moment(item.application_date).format(FORMAT_DATE) : '-',
      'Ngày công bố': item.publication_date ? moment(item.publication_date).format(FORMAT_DATE) : '-',
      'Số bằng': item.certificate_number || '-',
      'Ngày cấp': item.certificate_date ? moment(item.certificate_date).format(FORMAT_DATE) : '-',
      'Chủ đơn/Chủ bằng': (item as any).owner_id ? (companyMap[(item as any).owner_id] || '-') : '-',
      'Trạng thái': item.wipo_status || (item.certificate_number ? 'Cấp bằng' : 'Đang giải quyết'),
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Kiểu dáng công nghiệp');

  const fileName = `Kieu_dang_cong_nghiep_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportPatentsToExcel = (data: any[], companyMap: Record<string, string>) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((item) => ({
      'Tên sáng chế': item.name || '-',
      'Số đơn': item.application_number || '-',
      'Ngày nộp đơn': item.application_date ? moment(item.application_date).format(FORMAT_DATE) : '-',
      'Ngày công bố': item.publication_date ? moment(item.publication_date).format(FORMAT_DATE) : '-',
      'Số bằng': item.certificate_number || '-',
      'Ngày cấp': item.certificate_date ? moment(item.certificate_date).format(FORMAT_DATE) : '-',
      'Chủ đơn': item.owner_id ? (companyMap[item.owner_id] || '-') : '-',
      'Phân loại IPC': item.ipc_list || '-',
      'Trạng thái': item.wipo_status || (item.certificate_number ? 'Cấp bằng' : 'Đang giải quyết'),
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sáng chế');

  const fileName = `Sang_che_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
