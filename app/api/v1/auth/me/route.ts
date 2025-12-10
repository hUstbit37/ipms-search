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

    console.log('[auth/me] Token from cookie:', tokenFromCookie?.value ? 'exists' : 'missing');
    console.log('[auth/me] Token from header:', tokenFromHeader ? 'exists' : 'missing');
    console.log('[auth/me] Final token:', token ? `exists (${token.substring(0, 20)}...)` : 'missing');

    if (!token) {
      console.error('[auth/me] No token provided');
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
    }

    console.log('[auth/me] Calling backend: /v1/auth/me');
    const response = await apiInstance.get("/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    console.log('[auth/me] Backend response status:', response.status);
    console.log('[auth/me] Backend response data:', JSON.stringify(response.data, null, 2));

    if (response.status !== 200) {
      console.error('[auth/me] Backend returned non-200 status:', response.status);
      return NextResponse.json({ success: false, message: response.data }, { status: response.status })
    }

    // Xử lý response data cẩn thận
    const responseData = response.data || {};
    
    // Nếu response.data là object, spread nó
    // Nếu không, trả về data trong field 'data'
    const dataToReturn = typeof responseData === 'object' && !Array.isArray(responseData) 
      ? responseData 
      : { data: responseData };

    console.log('[auth/me] Success, returning data');
    return NextResponse.json({ success: true, ...dataToReturn });
  } catch (error: any) {
    console.error('[auth/me] Error:', error.message);
    console.error('[auth/me] Error stack:', error.stack);
    console.error('[auth/me] Error response:', error.response?.data);
    console.error('[auth/me] Error status:', error.response?.status);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Internal server error",
        error: error.response?.data 
      }, 
      { status: error.response?.status || 500 }
    );
  }
}
