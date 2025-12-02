import { type NextRequest, NextResponse } from "next/server";
import apiInstance from "@/lib/api/apiInstance";
import { AxiosError } from "axios";
import { ResponseError } from "@/types/api";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token");
  const { nextUrl } = req;

  const params = nextUrl.searchParams;

  try {
    const response = await apiInstance.get("/v1/companies", {
      headers: {
        Authorization: `Bearer ${token?.value}`,
      },
      params,
    });

    if (response.status !== 200) {
      return NextResponse.json({ success: false, message: response.data }, { status: response.status })
    }

    return NextResponse.json({ success: true, ...response?.data });
  } catch (e) {
    const error = e as unknown as AxiosError<ResponseError<{data: null}>>;
    return NextResponse.json({ success: false, message: error.message }, { status: error.status });
  }
}
