import { type NextRequest, NextResponse } from "next/server";
import apiInstance from "@/lib/api/apiInstance";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token");

  const response = await apiInstance.get("/v1/auth/me", {
    headers: {
      Authorization: `Bearer ${token?.value}`,
    }
  });

  if (response.status !== 200) {
    return NextResponse.json({ success: false, message: response.data }, { status: response.status })
  }

  return NextResponse.json({ success: true, ...response?.data });
}
