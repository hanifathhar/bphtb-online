export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getUserFromRequest, ROLE_LABELS } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const userPayload = getUserFromRequest(req);

    if (!userPayload) {
      return NextResponse.json(
        { error: "Unauthorized / Session Expired" },
        { status: 401 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: userPayload.id },
      select: {
        id: true,
        nmPengguna: true,
        username: true,
        email: true,
        level: true,
        status: true,
        dateCreate: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    const level = admin.level || 1;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: admin.id,
        nama: admin.nmPengguna || admin.username,
        username: admin.username,
        email: admin.email,
        level,
        role: userPayload.roleName,
        roleLabel: ROLE_LABELS[level] || "Pengguna BPHTB",
      },
    });
  } catch (error) {
    console.error("Me Route Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan memuat data pengguna" },
      { status: 500 }
    );
  }
}
