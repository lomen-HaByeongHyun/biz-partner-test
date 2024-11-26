import NextAuth from "next-auth";
import AppleProvider from "next-auth/providers/apple";
import { createPrivateKey } from "crypto";
import { SignJWT } from "jose";

async function getAppleToken() {
  const key = `-----BEGIN PRIVATE KEY-----\n${process.env.AUTH_APPLE_SECRET}\n-----END PRIVATE KEY-----`;

  try {
    const token = await new SignJWT({})
      .setAudience("https://appleid.apple.com")
      .setIssuer(process.env.APPLE_TEAM_ID)
      .setIssuedAt(Math.floor(Date.now() / 1000))
      .setExpirationTime(Math.floor(Date.now() / 1000) + 3600 * 2)
      .setSubject(process.env.APPLE_ID)
      .setProtectedHeader({
        alg: "ES256",
        kid: process.env.APPLE_KEY_ID,
      })
      .sign(createPrivateKey(key));

    console.log("Generated Apple Token:", token); // 디버깅용 로그
    return token;
  } catch (error) {
    console.error("Error generating Apple Token:", error);
    throw error;
  }
}

export default NextAuth({
  providers: [
    AppleProvider({
      clientId: process.env.APPLE_ID,
      clientSecret: async () => await getAppleToken(),
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          from: "apple",
        };
      },
    }),
  ],
});
