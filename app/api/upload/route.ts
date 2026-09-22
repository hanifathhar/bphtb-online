export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Validasi Ukuran File (Maksimal 1MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `Ukuran file (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal 1 MB`,
        },
        { status: 400 }
      );
    }

    // Validasi Tipe File
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "application/pdf",
    ];
    const fileType = file.type.toLowerCase();
    const extension = path.extname(file.name).toLowerCase();
    const allowedExts = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

    if (!allowedTypes.includes(fileType) && !allowedExts.includes(extension)) {
      return NextResponse.json(
        {
          error: "Format file tidak didukung. Hanya file PDF, JPG, JPEG, dan PNG yang diperbolehkan.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Pastikan direktori public/uploads ada
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Format nama file yang aman dan unik
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}_${cleanFileName}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      message: "File berhasil diunggah",
      data: {
        url: fileUrl,
        filename: uniqueFileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah file: " + error.message },
      { status: 500 }
    );
  }
}
