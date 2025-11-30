import * as z from "zod";

export const loginSchema = z.object({
  username: z.string({ message: "Bạn cần nhập thông tin tên đăng nhập" }).min(1, { message: "Bạn cần nhập thông tin tên đăng nhập" }),
  password: z.string({ message: "Bạn cần nhập thông tin mật khẩu" }).min(1, { message: "Bạn cần nhập thông tin mật khẩu" }),
})

export type LoginFormData = z.infer<typeof loginSchema>
