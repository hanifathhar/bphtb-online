export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUserToken, ROLE_LEVELS, ROLE_LABELS } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    if (admin.status !== 1 || admin.baned === "Y") {
      return NextResponse.json(
        { error: "Akun Anda dinonaktifkan atau diblokir. Hubungi Administrator." },
        { status: 403 }
      );
    }

    let isPasswordValid = false;

    // Check bcrypt hash
    if (admin.password.startsWith("$2a$") || admin.password.startsWith("$2b$")) {
      isPasswordValid = await bcrypt.compare(password, admin.password);
    } else {
      // Fallback plain-text check for legacy/dev, and upgrade to bcrypt
      isPasswordValid = password === admin.password;
      if (isPasswordValid) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.admin.update({
          where: { id: admin.id },
          data: { password: hashedPassword },
        });
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Password yang Anda masukkan salah" },
        { status: 401 }
      );
    }

    const level = admin.level || 1;
    const roleName = ROLE_LEVELS[level] || "ADMIN";
    const roleLabel = ROLE_LABELS[level] || "Pengguna BPHTB";

    const token = signUserToken({
      id: admin.id,
      username: admin.username,
      nama: admin.nmPengguna || admin.username,
      level,
      email: admin.email,
    });

    // Update login history
    await prisma.admin.update({
      where: { id: admin.id },
      data: { logintime: Math.floor(Date.now() / 1000) },
    });

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: admin.id,
        nama: admin.nmPengguna || admin.username,
        username: admin.username,
        email: admin.email,
        level,
        role: roleName,
        roleLabel,
      },
      token,
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat autentikasi" },
      { status: 500 }
    );
  }
}
