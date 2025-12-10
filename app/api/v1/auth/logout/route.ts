import { type NextRequest, NextResponse } from "next/server";
import apiInstance from "@/lib/api/apiInstance";

export async function POST(req: NextRequest) {
  // Lấy token từ cookie hoặc từ header (ưu tiên header)
  const tokenFromCookie = req.cookies.get("token");
  const tokenFromHeader = req.headers.get("authorization")?.replace("Bearer ", "") || 
                         req.headers.get("x-token");
  const token = tokenFromHeader || tokenFromCookie?.value;

  if (token) {
    try {
      await apiInstance.post("/v1/auth/logout", undefined, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
    } catch (error) {
      // Ignore logout errors from backend
      console.error('[auth/logout] Backend logout error:', error);
    }
  }

  const res = NextResponse.json({ success: true });

  res.cookies.set("token", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: false, // Set to false for HTTP environments
    sameSite: "lax",
  });

  res.cookies.delete("token")

  return res;
}
