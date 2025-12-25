import { type NextRequest, NextResponse } from "next/server";
import apiInstance from "@/lib/api/apiInstance";
import { AxiosError } from "axios";
import { ResponseError } from "@/types/api";

export async function GET(req: NextRequest) {
  return handleRequest(req, 'GET');
}

export async function POST(req: NextRequest) {
  return handleRequest(req, 'POST');
}

export async function PUT(req: NextRequest) {
  return handleRequest(req, 'PUT');
}

export async function DELETE(req: NextRequest) {
  return handleRequest(req, 'DELETE');
}

export async function PATCH(req: NextRequest) {
  return handleRequest(req, 'PATCH');
}

async function handleRequest(req: NextRequest, method: string) {
  try {
    // Lấy token từ cookie hoặc từ header (ưu tiên header)
    const tokenFromCookie = req.cookies.get("token");
    const tokenFromHeader = req.headers.get("authorization")?.replace("Bearer ", "") || 
                           req.headers.get("x-token");
    const token = tokenFromHeader || tokenFromCookie?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
    }

    // Lấy path từ dynamic route
    const { pathname } = req.nextUrl;
    const pathMatch = pathname.match(/\/api\/v1\/dashboard\/(.+)$/);
    const backendPath = pathMatch ? `/v1/dashboard/${pathMatch[1]}` : '/v1/dashboard';

    const { nextUrl } = req;
    const params = nextUrl.searchParams;

    // Lấy body nếu là POST, PUT, PATCH
    let body = null;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const contentType = req.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          body = await req.json();
        } else if (contentType?.includes('multipart/form-data')) {
          // For FormData, we need to pass it through differently
          const formData = await req.formData();
          body = formData;
        }
      } catch (e) {
        // Body might be empty or invalid, continue without it
        console.warn('Failed to parse request body:', e);
      }
    }

    const config: any = {
      method: method as any,
      url: backendPath,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: method === 'GET' ? params : undefined,
    };

    // Add body for POST, PUT, PATCH
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      if (body instanceof FormData) {
        config.data = body;
        // Don't set Content-Type header for FormData, let axios set it with boundary
        delete config.headers['Content-Type'];
      } else {
        config.data = body;
      }
    }

    const response = await apiInstance(config);

    // Handle blob responses (for downloads)
    if (response.data instanceof Blob || response.headers['content-type']?.includes('application/octet-stream')) {
      return new NextResponse(response.data, {
        status: response.status,
        headers: {
          'Content-Type': response.headers['content-type'] || 'application/octet-stream',
          'Content-Disposition': response.headers['content-disposition'] || 'attachment',
        },
      });
    }

    if (response.status !== 200 && response.status !== 201) {
      return NextResponse.json({ success: false, message: response.data }, { status: response.status })
    }

    return NextResponse.json(response.data);
  } catch (e) {
    const error = e as unknown as AxiosError<ResponseError<{data: null}>>;
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Internal server error',
      error: error.response?.data 
    }, { status: error.response?.status || 500 });
  }
}

