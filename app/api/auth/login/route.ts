export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUserToken, ROLE_LEVELS, ROLE_LABELS } from "@/lib/auth";

const FALLBACK_ADMIN_HASHES = [
  "$2b$10$Gehj2xfWaO.118/ExSlnn.7JaMEOUlFSycQJ4YReS3DwYsjnjEo.W", // Local DB admin hash
  "$2b$10$p8k1tlw0r9WWn/GZ43dNBePa1cIri/cEjVOKo7n9rtnqbeJkqGlm2", // Server DB admin hash
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawUsername = body?.username?.toString().trim() || "";
    const password = body?.password?.toString() || "";

    if (!rawUsername || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findFirst({
      where: {
        username: {
          equals: rawUsername,
          mode: "insensitive",
        },
      },
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

    // 1. Check current DB bcrypt hash or plain-text
    if (admin.password.startsWith("$2a$") || admin.password.startsWith("$2b$")) {
      isPasswordValid = await bcrypt.compare(password, admin.password);
    } else {
      isPasswordValid = password === admin.password;
      if (isPasswordValid) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.admin.update({
          where: { id: admin.id },
          data: { password: hashedPassword },
        });
      }
    }

    // 2. Fallback check for admin hashes (local vs server DB sync) & default credentials
    if (!isPasswordValid && admin.username.toLowerCase() === "admin") {
      for (const fallbackHash of FALLBACK_ADMIN_HASHES) {
        if (await bcrypt.compare(password, fallbackHash)) {
          isPasswordValid = true;
          break;
        }
      }
      if (!isPasswordValid && (password === "password123" || password === "admin123")) {
        isPasswordValid = true;
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
      httpOnly: false,
      secure: false, // Set false agar bisa digunakan pada akses HTTP IP Public/Lokal
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
