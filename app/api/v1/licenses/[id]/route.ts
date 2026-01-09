import { type NextRequest, NextResponse } from "next/server";
import apiInstance from "@/lib/api/apiInstance";
import { AxiosError } from "axios";
import { ResponseError } from "@/types/api";

// Route handler lấy chi tiết một license theo ID
// FE sẽ gọi vào /api/v1/licenses/:id, route này proxy sang BE /v1/licenses/:id
export async function GET(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const {
    params: { id },
  } = context;

  // Lấy token từ cookie hoặc từ header (ưu tiên header)
  const tokenFromCookie = req.cookies.get("token");
  const tokenFromHeader =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.headers.get("x-token");
  const token = tokenFromHeader || tokenFromCookie?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "No token provided" },
      { status: 401 },
    );
  }

  try {
    const response = await apiInstance.get(`/v1/licenses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status !== 200) {
      return NextResponse.json(
        { success: false, message: response.data },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, ...response.data });
  } catch (e) {
    const error = e as unknown as AxiosError<ResponseError<{ data: null }>>;

    // Trả nguyên dữ liệu lỗi từ BE nếu có để FE dễ debug (ví dụ 422 validation error)
    if (error.response) {
      return NextResponse.json(
        error.response.data,
        { status: error.response.status || 500 },
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// Route handler cập nhật license theo ID bằng một API duy nhất
// FE gọi PUT /api/v1/licenses/:id với payload tổng hợp (có thể kèm trường step để BE biết đang cập nhật phần nào)
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const {
    params: { id },
  } = context;

  // Lấy token từ cookie hoặc từ header (ưu tiên header)
  const tokenFromCookie = req.cookies.get("token");
  const tokenFromHeader =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.headers.get("x-token");
  const token = tokenFromHeader || tokenFromCookie?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "No token provided" },
      { status: 401 },
    );
  }

  const body = await req.json();

  try {
    const response = await apiInstance.put(`/v1/licenses/${id}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status < 200 || response.status >= 300) {
      return NextResponse.json(
        { success: false, message: response.data },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, ...response.data });
  } catch (e) {
    const error = e as unknown as AxiosError<ResponseError<{ data: null }>>;
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.response?.status || 500 },
    );
  }
}

// Route handler xóa license theo ID
// FE gọi DELETE /api/v1/licenses/:id, route này proxy sang BE /v1/licenses/:id
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const {
    params: { id },
  } = context;


  // Lấy token từ cookie hoặc từ header (ưu tiên header)
  const tokenFromCookie = req.cookies.get("token");
  const tokenFromHeader =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.headers.get("x-token");
  const token = tokenFromHeader || tokenFromCookie?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "No token provided" },
      { status: 401 },
    );
  }

  try {
    const targetUrl = `/v1/licenses/${id}`;
    console.log("[licenses][DELETE] Calling backend URL:", targetUrl);

    const response = await apiInstance.delete(targetUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status < 200 || response.status >= 300) {
      return NextResponse.json(
        { success: false, message: response.data },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const error = e as unknown as AxiosError<ResponseError<{ data: null }>>;
    console.error(
      "[licenses][DELETE] Backend error status:",
      error.response?.status,
      "data:",
      error.response?.data,
    );
    // Trả nguyên dữ liệu lỗi từ BE nếu có để FE dễ debug (ví dụ 422 validation error)
    if (error.response) {
      return NextResponse.json(
        error.response.data,
        { status: error.response.status || 500 },
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

