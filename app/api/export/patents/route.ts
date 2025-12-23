import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import moment from 'moment';
import { Buffer } from 'buffer';
import { FORMAT_DATE } from '@/constants';

export const runtime = 'nodejs';

type PatentItem = {
  name?: string;
  application_number?: string;
  application_date?: string;
  publication_date?: string;
  certificate_number?: string;
  certificate_date?: string;
  owner_name?: string;
  owner?: string;
  wipo_status?: string;
  image_url?: string;
  ipc_list?: string[] | string;
  [key: string]: any;
};

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: PatentItem[] = body?.items || [];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sáng chế');

    worksheet.columns = [
      { header: 'Hình ảnh', key: 'image', width: 35 },
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

    // Start from row 2 because row 1 is header
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const rowNumber = index + 2;

      // Add row with all data first
      const row = worksheet.addRow({
        image: '',
        name: item.name || '-',
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
        owner: item.owner_name || item.owner || '-',
        ipc_list: Array.isArray(item.ipc_list)
          ? item.ipc_list.join(', ')
          : item.ipc_list || '-',
        status:
          item.wipo_status ||
          (item.certificate_number ? 'Cấp bằng' : 'Đang giải quyết'),
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

    const fileName = `Sang_che_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
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
    console.error('Failed to generate patents Excel with images', error);
    return NextResponse.json(
      { message: 'Failed to generate Excel file' },
      { status: 500 },
    );
  }
}

