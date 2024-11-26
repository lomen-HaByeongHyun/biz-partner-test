import NextAuth from "next-auth";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import Apple from "next-auth/providers/apple";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Kakao, Naver, Apple],
  // session: {
  //   strategy: "jwt",
  //   maxAge: 30, // 30초
  // },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // 로그인 성공 시 /login으로 이동
      console.log(url, baseUrl);

      if (url === "/auth/callback/kakao") {
        return `${baseUrl}/login`;
      }

      // 로그인 실패 시 메인 페이지로 이동
      return `${baseUrl}/`;
    },
  },
});
