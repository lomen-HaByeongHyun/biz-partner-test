import NextAuth from "next-auth";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import Apple from "next-auth/providers/apple";
import { createPrivateKey } from "crypto";
import process from "process";
import { SignJWT } from "jose";

const getAppleToken = async () => {
  const key = `-----BEGIN PRIVATE KEY-----\n${process.env.AUTH_APPLE_SECRET}\n-----END PRIVATE KEY-----`;

  try {
    const token = new SignJWT({})
      .setAudience("https://appleid.apple.com")
      .setIssuer(process.env.AUTH_APPLE_TEAM_ID)
      .setIssuedAt(Math.floor(Date.now() / 1000))
      .setExpirationTime(Math.floor(Date.now() / 1000) + 3600 * 2)
      .setSubject(process.env.AUTH_APPLE_ID)
      .setProtectedHeader({
        alg: "ES256",
        kid: process.env.AUTH_APPLE_KEY_ID,
      })
      .sign(createPrivateKey(key));

    return token;
  } catch (error) {
    console.log("error", error);
  }
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
  secret: process.env.AUTH_SECRET,

  providers: [
    Kakao,
    Naver,
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: async () => await getAppleToken(),
      wellKnown: "https://appleid.apple.com/.well-known/openid-configuration",
      checks: ["pkce"],
      token: {
        url: `https://appleid.apple.com/auth/token`,
      },
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
      authorization: {
        url: "https://appleid.apple.com/auth/authorize",
        params: {
          scope: "",
          response_mode: "form_post",
          response_type: "code",
          state: crypto.randomUUID(),
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          email: profile.email,
          image: "",
        };
      },
    }),
  ],
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
