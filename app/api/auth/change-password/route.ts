export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Password lama dan baru wajib diisi" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: userPayload.id },
    });

    if (!admin) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    let isMatch = false;
    if (admin.password.startsWith("$2a$") || admin.password.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(oldPassword, admin.password);
    } else {
      isMatch = oldPassword === admin.password;
    }

    if (!isMatch) {
      return NextResponse.json(
        { error: "Password lama yang Anda masukkan salah" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashed },
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil diperbarui",
    });
  } catch (error: any) {
    console.error("Change Password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat mengubah password" },
      { status: 500 }
    );
  }
}
