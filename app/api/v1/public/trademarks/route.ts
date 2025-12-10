import { type NextRequest, NextResponse } from "next/server";
import apiInstance from "@/lib/api/apiInstance";
import { AxiosError } from "axios";
import { ResponseError } from "@/types/api";

export async function GET(req: NextRequest) {
  // Lấy token từ cookie hoặc từ header (ưu tiên header)
  const tokenFromCookie = req.cookies.get("token");
  const tokenFromHeader = req.headers.get("authorization")?.replace("Bearer ", "") || 
                         req.headers.get("x-token");
  const token = tokenFromHeader || tokenFromCookie?.value;

  console.log('[trademarks] Token from cookie:', tokenFromCookie?.value ? 'exists' : 'missing');
  console.log('[trademarks] Token from header:', tokenFromHeader ? 'exists' : 'missing');
  console.log('[trademarks] Final token:', token ? `exists (${token.substring(0, 20)}...)` : 'missing');

  const { nextUrl } = req;
  const params = nextUrl.searchParams;

  if (!token) {
    console.error('[trademarks] No token provided');
    return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
  }

  try {
    console.log('[trademarks] Calling backend: /v1/public/trademarks');
    const response = await apiInstance.get("/v1/public/trademarks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    console.log('[trademarks] Backend response status:', response.status);

    if (response.status !== 200) {
      return NextResponse.json({ success: false, message: response.data }, { status: response.status })
    }

    return NextResponse.json({ success: true, ...response?.data });
  } catch (e) {
    const error = e as unknown as AxiosError<ResponseError<{data: null}>>;
    console.error('[trademarks] Error:', error.message);
    console.error('[trademarks] Error status:', error.response?.status);
    console.error('[trademarks] Error data:', error.response?.data);
    return NextResponse.json({ success: false, message: error.message }, { status: error.response?.status || 500 });
  }
}
