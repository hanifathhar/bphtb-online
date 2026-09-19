export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ROLE_LEVELS } from "@/lib/auth";

export async function POST(req: Request) {
  try {
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
        { error: "Username sudah digunakan" },
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
      message: "Registrasi pengguna berhasil",
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
