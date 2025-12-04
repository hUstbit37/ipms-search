import { NextResponse } from "next/server";
import apiInstance from "@/lib/api/apiInstance";
import { LoginResponse } from "@/services/auth.service";
import { AxiosError } from "axios";
import { ResponseError } from "@/types/api";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  try {
    const response = await apiInstance.post<LoginResponse>("/v1/auth/login", {
      username: username.trim(),
      password: password.trim(),
    });

    const data = response.data;
    if (!data?.access_token) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const res = NextResponse.json({ success: true, ...data });
    res.cookies.set("token", data.access_token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production" && !process.env.NOT_SUCURE,
      sameSite: "lax",
    });

    return res;
  } catch (error) {
    const errorResponse = error as unknown as AxiosError<ResponseError<{data: null}>>;
    return NextResponse.json({ success: false, message: errorResponse.message }, { status: errorResponse?.status });
  }
}
