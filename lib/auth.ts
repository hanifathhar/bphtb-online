import { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-super-aman-bphtb-2026";

export interface UserJwtPayload extends JwtPayload {
  id: number;
  username: string;
  nama: string;
  level: number;
  roleName: string;
  email?: string | null;
}

export const ROLE_LEVELS: Record<number, string> = {
  1: "ADMIN",
  2: "PENDAFTARAN",
  3: "VERIFIKATOR_1",
  4: "VERIFIKATOR_2",
  5: "VERIFIKATOR_3",
  6: "BANK",
  7: "PPAT",
};

export const ROLE_LABELS: Record<number, string> = {
  1: "Administrator Sistem",
  2: "Petugas Loket / Pendaftaran",
  3: "Verifikator 1 (Pemeriksa Administrasi)",
  4: "Verifikator 2 (Kasi Teknis)",
  5: "Verifikator 3 (Kabid / Penetapan)",
  6: "Petugas Bank / Kasir",
  7: "PPAT / Notaris",
};

export function getUserFromRequest(
  req: Request | NextRequest
): UserJwtPayload | null {
  try {
    const authHeader = req.headers.get("authorization");

    let token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token && "cookies" in req && typeof (req as any).cookies?.get === "function") {
      token = (req as NextRequest).cookies.get("token")?.value || null;
    }

    if (!token) {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(/token=([^;]+)/);
        if (match) token = match[1];
      }
    }

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as UserJwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function signUserToken(payload: {
  id: number;
  username: string;
  nama: string;
  level: number;
  email?: string | null;
}) {
  const roleName = ROLE_LEVELS[payload.level] || "USER";
  return jwt.sign(
    {
      id: payload.id,
      username: payload.username,
      nama: payload.nama,
      level: payload.level,
      roleName,
      email: payload.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}