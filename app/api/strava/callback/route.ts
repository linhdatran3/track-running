// import { NextRequest, NextResponse } from "next/server";
// import { exchangeToken } from "@/lib/strava";
// import { prisma } from "@/lib/db";

// export async function GET(req: NextRequest) {
//   const code = req.nextUrl.searchParams.get("code");
//   const error = req.nextUrl.searchParams.get("error");

//   if (error) {
//     return NextResponse.redirect(
//       new URL(`/?oauth_error=${encodeURIComponent(error)}`, req.url)
//     );
//   }
//   if (!code) {
//     return NextResponse.redirect(
//       new URL(`/?oauth_error=missing_code`, req.url)
//     );
//   }

//   try {
//     const tok = await exchangeToken(code);

//     // Lưu/ghi đè theo athlete.id (demo single-user)
//     await prisma.user.upsert({
//       where: { stravaAthleteId: tok.athlete?.id ?? 0 }, // 0 để where tồn tại; create vẫn chạy khi null
//       update: {
//         accessToken: tok.access_token,
//         refreshToken: tok.refresh_token,
//         expiresAt: tok.expires_at,
//       },
//       create: {
//         stravaAthleteId: tok.athlete?.id ?? null,
//         accessToken: tok.access_token,
//         refreshToken: tok.refresh_token,
//         expiresAt: tok.expires_at,
//       },
//     });

//     return NextResponse.redirect(new URL("/?connected=strava", req.url));
//   } catch (e: unknown) {
//     return NextResponse.redirect(
//       new URL(
//         `/?oauth_error=${encodeURIComponent(
//           (e as { message: string }).message
//         )}`,
//         req.url
//       )
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { exchangeToken } from "@/lib/strava";
import { prisma } from "@/lib/db";
import { createSessionForUser } from "@/lib/auth";
import { FetchError } from "@/utils/fetcher";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  if (error)
    return NextResponse.redirect(
      new URL(`/?oauth_error=${encodeURIComponent(error)}`, req.url)
    );
  if (!code)
    return NextResponse.redirect(
      new URL(`/?oauth_error=missing_code`, req.url)
    );

  try {
    const tok = await exchangeToken(code); // returns access_token, refresh_token, expires_at, athlete
    const athlete = tok?.athlete;
    // upsert user by stravaAthleteId
    const user = await prisma.user.upsert({
      where: { stravaAthleteId: athlete?.id ?? 0 },
      update: {
        username: athlete?.username,
        firstname: athlete?.firstname,
        lastname: athlete?.lastname,
        profilePhoto: athlete?.profilePhoto,
        accessToken: tok.access_token,
        refreshToken: tok.refresh_token,
        expiresAt: tok.expires_at,
      },
      create: {
        stravaAthleteId: athlete?.id ?? null,
        username: athlete?.username,
        firstname: athlete?.firstname,
        lastname: athlete?.lastname,
        profilePhoto: athlete?.profilePhoto,
        accessToken: tok.access_token,
        refreshToken: tok.refresh_token,
        expiresAt: tok.expires_at,
      },
    });

    // create session and set cookie
    const { token, expiresAt } = await createSessionForUser(user.id);
    const res = NextResponse.redirect(new URL("/", req.url));
    const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

    res.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge,
    });

    return res;
  } catch (e: unknown) {
    return NextResponse.redirect(
      new URL(
        `/?oauth_error=${encodeURIComponent((e as FetchError)?.message ?? "")}`,
        req.url
      )
    );
  }
}
