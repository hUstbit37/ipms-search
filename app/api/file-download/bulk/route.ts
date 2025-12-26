import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Lấy file_ids từ request body
    const body = await request.json();
    const { file_ids } = body;

    // Lấy token từ headers
    const token = request.headers.get('authorization') || request.headers.get('x-token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call backend API
    const BACKEND_URL = process.env.BACKEND_API_URL || 'http://20.205.246.175/api';
    const response = await fetch(
      `${BACKEND_URL}/v1/file-management/files/bulk-download`,
      {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': 'application/zip, application/octet-stream, */*',
        },
        body: JSON.stringify({ file_ids }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Lấy blob từ response
    const blob = await response.blob();
    
    // Trả về blob với headers đúng
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="documents_${Date.now()}.zip"`,
      },
    });
  } catch (error: any) {
    console.error('[Bulk Download Proxy] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
