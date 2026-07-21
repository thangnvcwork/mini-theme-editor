import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/", // dùng luôn trang chủ làm trang login, hoặc đổi path khác nếu muốn
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user; // chỉ cho qua nếu đã đăng nhập
    },
  },
});