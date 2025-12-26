import { type NextRequest, NextResponse } from "next/server";
import apiInstance from "@/lib/api/apiInstance";
import { AxiosError } from "axios";
import { ResponseError } from "@/types/api";

export async function GET(req: NextRequest) {
  try {
    // Lấy token từ cookie hoặc từ header (ưu tiên header)
    const tokenFromCookie = req.cookies.get("token");
    const tokenFromHeader = req.headers.get("authorization")?.replace("Bearer ", "") || 
                           req.headers.get("x-token");
    const token = tokenFromHeader || tokenFromCookie?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
    }

    const { nextUrl } = req;
    const params = nextUrl.searchParams;

    const response = await apiInstance.get("/v1/organizations", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    if (response.status !== 200) {
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

export async function POST(req: NextRequest) {
  try {
    // Lấy token từ cookie hoặc từ header (ưu tiên header)
    const tokenFromCookie = req.cookies.get("token");
    const tokenFromHeader = req.headers.get("authorization")?.replace("Bearer ", "") || 
                           req.headers.get("x-token");
    const token = tokenFromHeader || tokenFromCookie?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
    }

    const body = await req.json();

    const response = await apiInstance.post("/v1/organizations", body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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

export async function PUT(req: NextRequest) {
  try {
    // Lấy token từ cookie hoặc từ header (ưu tiên header)
    const tokenFromCookie = req.cookies.get("token");
    const tokenFromHeader = req.headers.get("authorization")?.replace("Bearer ", "") || 
                           req.headers.get("x-token");
    const token = tokenFromHeader || tokenFromCookie?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
    }

    const body = await req.json();

    const response = await apiInstance.put("/v1/organizations", body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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

export async function DELETE(req: NextRequest) {
  try {
    // Lấy token từ cookie hoặc từ header (ưu tiên header)
    const tokenFromCookie = req.cookies.get("token");
    const tokenFromHeader = req.headers.get("authorization")?.replace("Bearer ", "") || 
                           req.headers.get("x-token");
    const token = tokenFromHeader || tokenFromCookie?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
    }

    const { nextUrl } = req;
    const params = nextUrl.searchParams;

    const response = await apiInstance.delete("/v1/organizations", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    if (response.status !== 200 && response.status !== 204) {
      return NextResponse.json({ success: false, message: response.data }, { status: response.status })
    }

    return NextResponse.json(response.data || { success: true });
  } catch (e) {
    const error = e as unknown as AxiosError<ResponseError<{data: null}>>;
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Internal server error',
      error: error.response?.data 
    }, { status: error.response?.status || 500 });
  }
}

