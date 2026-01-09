import { type NextRequest, NextResponse } from "next/server";
import apiInstance from "@/lib/api/apiInstance";
import { AxiosError } from "axios";
import { ResponseError } from "@/types/api";

// Route handler lấy danh sách license theo phân trang và bộ lọc
// FE sẽ gọi vào /api/v1/licenses, route này proxy sang BE /v1/licenses
export async function GET(req: NextRequest) {
  // Lấy token từ cookie hoặc từ header (ưu tiên header)
  const tokenFromCookie = req.cookies.get("token");
  const tokenFromHeader =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.headers.get("x-token");
  const token = tokenFromHeader || tokenFromCookie?.value;

  const { nextUrl } = req;
  const params = nextUrl.searchParams;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "No token provided" },
      { status: 401 },
    );
  }

  try {
    const response = await apiInstance.get("/v1/licenses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
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
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.response?.status || 500 },
    );
  }
}


