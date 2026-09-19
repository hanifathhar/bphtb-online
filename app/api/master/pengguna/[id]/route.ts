export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getUserFromRequest, ROLE_LEVELS } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.level !== 1) {
      return NextResponse.json({ error: "Akses ditolak. Khusus Admin." }, { status: 403 });
    }

    const { id } = await params;
    const { nmPengguna, email, level, status, baned, password } = await req.json();

    const updateData: any = {
      nmPengguna,
      email,
      level: parseInt(level || 1),
      roleName: ROLE_LEVELS[parseInt(level || 1)] || "USER",
      status: parseInt(status !== undefined ? status : 1),
      baned: baned || "N",
    };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.level !== 1) {
      return NextResponse.json({ error: "Akses ditolak. Khusus Admin." }, { status: 403 });
    }

    const { id } = await params;
    await prisma.admin.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true, message: "Pengguna berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
