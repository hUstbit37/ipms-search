import { type NextRequest, NextResponse } from "next/server";
import apiInstance from "@/lib/api/apiInstance";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token");

  await apiInstance.post("/v1/auth/logout", undefined, {
    headers: {
      Authorization: `Bearer ${token?.value}`,
    }
  });

  const res = NextResponse.json({ success: true });

  res.cookies.set("token", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && !process.env.NOT_SUCURE,
    sameSite: "lax",
  });

  res.cookies.delete("token")

  return res;
}
