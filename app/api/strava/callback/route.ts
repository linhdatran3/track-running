import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  if (error) return NextResponse.json({ error }, { status: 400 });
  if (!code) {
    return NextResponse.json(
      { message: "No code received. Please authorize the app on Strava." },
      { status: 400 }
    );
  }
  // Day 1: xác nhận redirect hoạt động. Day 2 sẽ thêm bước đổi token và lưu DB.
  return NextResponse.json({
    message: "OAuth redirect successful.",
    note: "Next: exchange this code for tokens in Day 2.",
    code,
  });
}
