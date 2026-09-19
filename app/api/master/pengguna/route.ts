export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getUserFromRequest, ROLE_LEVELS, ROLE_LABELS } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.level !== 1) {
      return NextResponse.json({ error: "Akses ditolak. Khusus Admin." }, { status: 403 });
    }

    const users = await prisma.admin.findMany({
      select: {
        id: true,
        nmPengguna: true,
        username: true,
        email: true,
        level: true,
        status: true,
        baned: true,
        dateCreate: true,
        roleName: true,
      },
      orderBy: { id: "asc" },
    });

    const formatted = users.map((u) => ({
      ...u,
      roleLabel: ROLE_LABELS[u.level || 1] || "Pengguna",
      roleCode: ROLE_LEVELS[u.level || 1] || "USER",
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.level !== 1) {
      return NextResponse.json({ error: "Akses ditolak. Khusus Admin." }, { status: 403 });
    }

    const { username, password, nmPengguna, email, level } = await req.json();

    if (!username || !password || !nmPengguna) {
      return NextResponse.json(
        { error: "Username, password, dan nama pengguna wajib diisi" },
        { status: 400 }
      );
    }

    const existing = await prisma.admin.findUnique({
      where: { username },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Username sudah terdaftar" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userLevel = parseInt(level || 2);
    const roleName = ROLE_LEVELS[userLevel] || "USER";

    const created = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        nmPengguna,
        email,
        level: userLevel,
        roleName,
        status: 1,
        baned: "N",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: created.id,
        username: created.username,
        nmPengguna: created.nmPengguna,
        level: created.level,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
