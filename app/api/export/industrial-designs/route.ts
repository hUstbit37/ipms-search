import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import moment from 'moment';
import { Buffer } from 'buffer';
import { FORMAT_DATE } from '@/constants';

export const runtime = 'nodejs';

type IndustrialDesignItem = {
  name?: string;
  application_number?: string;
  application_date?: string;
  publication_date?: string;
  certificate_number?: string;
  certificate_date?: string;
  owner_name?: string;
  wipo_status?: string;
  image_url?: string;
  [key: string]: any;
};

const applyHeaderStyle = (worksheet: ExcelJS.Worksheet) => {
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, size: 12 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2b5aeb' },
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

      // column.width = isEmpty ? 13.33 : 20;
      if (isEmpty) column.width = 13.33
    }
  });

  const borderStyle: Partial<ExcelJS.Border> = {
    style: 'thin',
    color: { argb: 'FF000000' },
  };

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: borderStyle,
        left: borderStyle,
        bottom: borderStyle,
        right: borderStyle,
      };

      if (row.number > 1) {
        cell.font = { size: 11 };
      }
    });
  });
};

const getImageExtension = (url: string): 'png' | 'jpeg' => {
  const pathname = (() => {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  })();

  if (pathname.endsWith('.png')) return 'png';
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'jpeg';
  // default
  return 'png';
};

const formatLocarnoList = (item: any): string => {
  // Prefer locarno_list_raw
  if (Array.isArray(item?.locarno_list_raw) && item.locarno_list_raw.length > 0) {
    return item.locarno_list_raw
      .filter((entry: unknown) => typeof entry === 'string' && entry.trim().length > 0)
      .map((entry: string) => entry.trim())
      .join(', ');
  }
  if (typeof item?.locarno_list_raw === 'string' && item.locarno_list_raw.trim().length > 0) {
    return item.locarno_list_raw.trim();
  }

  // Handle locarno_list
  if (Array.isArray(item?.locarno_list) && item.locarno_list.length > 0) {
    const firstItem = item.locarno_list[0];
    // array of objects with subclass and class_number
    if (typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem)) {
      return (item.locarno_list as Array<{ subclass?: string | null; class_number?: string | null }>)
        .map((it: any) => {
          const classNum = it.class_number || '';
          const subclass = it.subclass || '';
          if (classNum && subclass) return `${classNum}-${subclass}`;
          return classNum || subclass || '';
        })
        .filter((s: string) => s.trim().length > 0)
        .join(', ');
    }
    // array of strings
    if (typeof firstItem === 'string') {
      return (item.locarno_list as string[])
        .filter((entry) => typeof entry === 'string' && entry.trim().length > 0)
        .map((entry) => entry.trim())
        .join(', ');
    }
  }

  // string
  if (typeof item?.locarno_list === 'string' && item.locarno_list.trim().length > 0) {
    return item.locarno_list.trim();
  }

  return '-';
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: IndustrialDesignItem[] = body?.items || [];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Kiểu dáng công nghiệp');

    worksheet.columns = [
      { header: 'Hình ảnh', key: 'image', width: 20, style: { alignment: { vertical: 'middle' } } },
      { header: 'Tên', key: 'name', width: 20, style: { alignment: { vertical: 'middle' } } },
      { header: 'Loại TSTT', key: 'ip_type', width: 10, style: { alignment: { vertical: 'middle' } } },
      { header: 'Số đơn', key: 'application_number', width: 20, style: { alignment: { vertical: 'middle' } } },
      { header: 'Ngày nộp đơn', key: 'application_date', width: 20, style: { alignment: { vertical: 'middle' } } },
      { header: 'Ngày công bố', key: 'publication_date', width: 20, style: { alignment: { vertical: 'middle' } } },
      { header: 'Số bằng', key: 'certificate_number', width: 20, style: { alignment: { vertical: 'middle' } } },
      { header: 'Ngày cấp', key: 'certificate_date', width: 20, style: { alignment: { vertical: 'middle' } } },
      { header: 'Phân loại Locarno', key: 'locarno_list', width: 30, style: { alignment: { vertical: 'middle', wrapText: true } } },
      { header: 'Chủ đơn/Chủ bằng', key: 'owner', width: 50, style: { alignment: { vertical: 'middle', wrapText: true } } },
      { header: 'Trạng thái', key: 'status', width: 20, style: { alignment: { vertical: 'middle' } } },
      { header: 'Tác giả', key: 'authors', width: 50, style: { alignment: { vertical: 'middle', wrapText: true } } },
      { header: 'Đại diện', key: 'agency', width: 50, style: { alignment: { vertical: 'middle', wrapText: true } } },
      { header: 'Ghi chú nội bộ', key: 'note', width: 50, style: { alignment: { vertical: 'middle' } } },
    ];

    // Start from row 2 because row 1 is header
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const rowNumber = index + 2;

      // Add row with all data first
      const row = worksheet.addRow({
        image: '',
        name: item.name || '-',
        ip_type: 'KD',
        application_number: item.application_number || '-',
        application_date: item.application_date
          ? moment(item.application_date).format(FORMAT_DATE)
          : '-',
        publication_date: item.publication_date
          ? moment(item.publication_date).format(FORMAT_DATE)
          : '-',
        certificate_number: item.certificate_number || '-',
        certificate_date: item.certificate_date
          ? moment(item.certificate_date).format(FORMAT_DATE)
          : '-',
        locarno_list: formatLocarnoList(item),
        owner: item.owner_name || item.owners?.[0]?.name || item?.owner || '-',
        status:
          item.wipo_status ||
          (item.certificate_number ? 'Cấp bằng' : 'Đang giải quyết'),
        authors: item.authors_raw?.join(", ") || item.authors?.join(", ") || item.authors || '-',
        agency: item.agencies_raw?.join(", ") || item.agencies?.join(", ") || item.agency_name || '',
        note: item.note || '',
      });

      // Set row height for image
      row.height = 100;

      // Add image after row is created, using anchor coordinates
      const imageUrl =
        item.image_url ||
        (Array.isArray((item as any).image_urls)
          ? (item as any).image_urls[0]
          : undefined);

      if (imageUrl) {
        try {
          const res = await fetch(imageUrl, { cache: 'no-store' });
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer) as unknown as Buffer;
            const extension = getImageExtension(imageUrl);

            const imageId = workbook.addImage({
              buffer,
              extension,
            } as any);

            // Use anchor coordinates to place image in column A
            worksheet.addImage(imageId, {
              tl: { col: 0, row: rowNumber - 1 },
              ext: { width: 80, height: 80 },
            } as any);
          }
        } catch {
          // Ignore individual image errors, continue exporting
        }
      }
    }

    applyHeaderStyle(worksheet);

    const fileName = `Kieu_dang_cong_nghiep_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate industrial designs Excel with images', error);
    return NextResponse.json(
      { message: 'Failed to generate Excel file' },
      { status: 500 },
    );
  }
}

