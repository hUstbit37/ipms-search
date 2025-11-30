import { NextResponse } from "next/server";
import apiInstance from "@/lib/api/apiInstance";
import { LoginResponse } from "@/services/auth.service";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  try {
    const response = await apiInstance.post<LoginResponse>("/v1/auth/login", {
      username: username.trim(),
      password: password.trim(),
    });

    console.log({

    })

    const data = response.data;
    if (!data?.access_token) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, ...data });
    res.cookies.set("token", data.access_token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 ngày
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res;
  } catch (error) {
    return NextResponse.json({ success: false, message: error }, { status: 500 });
  }
}
