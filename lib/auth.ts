import crypto from "crypto";
import { prisma } from "./db";

export function genSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function createSessionForUser(
  userId: string,
  maxAgeSec = 60 * 60 * 24 * 30
) {
  const token = genSessionToken();
  const expiresAt = new Date(Date.now() + maxAgeSec * 1000);
  await prisma.session.create({
    data: { token, userId, expiresAt },
  });
  return { token, expiresAt };
}

export async function getUserBySessionToken(token?: string | null) {
  if (!token) return null;
  const s = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!s) return null;
  if (s.expiresAt < new Date()) {
    // expired: delete and return null
    await prisma.session.delete({ where: { id: s.id } });
    return null;
  }
  return s.user;
}

export async function getUserFromRequest(req: Request) {
  // In App Router server code use cookies via Headers:
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/session=([^;]+)/);
  const token = match ? match[1] : null;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  return session.user;
}
