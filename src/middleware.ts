export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/editor/:path*"], // chặn tất cả route bắt đầu bằng /editor
};