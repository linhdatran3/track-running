import { NextRequest, NextResponse } from "next/server";
// Nếu bạn có alias "@/*" trong tsconfig (create-next-app mặc định), dùng dòng dưới:
import { exchangeToken } from "@/lib/strava";
import { prisma } from "@/lib/db";
// Nếu alias chưa có, đổi thành đường dẫn tương đối:
// import { exchangeToken } from "../../../lib/strava";
// import { prisma } from "../../../lib/db";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/?oauth_error=${encodeURIComponent(error)}`, req.url)
    );
  }
  if (!code) {
    return NextResponse.redirect(
      new URL(`/?oauth_error=missing_code`, req.url)
    );
  }

  try {
    const tok = await exchangeToken(code);

    // Lưu/ghi đè theo athlete.id (demo single-user)
    await prisma.user.upsert({
      where: { stravaAthleteId: tok.athlete?.id ?? 0 }, // 0 để where tồn tại; create vẫn chạy khi null
      update: {
        accessToken: tok.access_token,
        refreshToken: tok.refresh_token,
        expiresAt: tok.expires_at,
      },
      create: {
        stravaAthleteId: tok.athlete?.id ?? null,
        accessToken: tok.access_token,
        refreshToken: tok.refresh_token,
        expiresAt: tok.expires_at,
      },
    });

    return NextResponse.redirect(new URL("/?connected=strava", req.url));
  } catch (e: unknown) {
    return NextResponse.redirect(
      new URL(
        `/?oauth_error=${encodeURIComponent(
          (e as { message: string }).message
        )}`,
        req.url
      )
    );
  }
}
