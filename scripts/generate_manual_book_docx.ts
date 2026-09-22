import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  ImageRun,
  Header,
  Footer,
} from "docx";
import * as fs from "fs";
import * as path from "path";

// Color Palette Constants
const COLOR_PRIMARY = "8D1624"; // Deep Maroon / Crimson
const COLOR_SECONDARY = "1E293B"; // Dark Slate
const COLOR_ACCENT = "0284C7"; // Ocean Blue
const COLOR_MUTED = "64748B"; // Slate Gray
const COLOR_BG_LIGHT = "F8FAFC"; // Light Gray Background
const COLOR_BORDER = "CBD5E1"; // Border Gray

function createHeaderBox(title: string, subtitle: string) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.SINGLE, size: 16, color: COLOR_PRIMARY },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: "FDF2F4", type: ShadingType.CLEAR },
            margins: { top: 200, bottom: 200, left: 240, right: 240 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: title,
                    bold: true,
                    size: 28,
                    color: COLOR_PRIMARY,
                    font: "Calibri",
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: subtitle,
                    size: 20,
                    color: COLOR_MUTED,
                    font: "Calibri",
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createImageBox(imageFilename: string, caption: string) {
  const imgPath = path.join(__dirname, "../public/manual-book-img", imageFilename);
  if (!fs.existsSync(imgPath)) {
    return new Paragraph({
      children: [new TextRun({ text: `[Gambar: ${caption}]`, italics: true, color: COLOR_MUTED })],
    });
  }

  const imgBuffer = fs.readFileSync(imgPath);

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 80 },
                children: [
                  new ImageRun({
                    data: imgBuffer,
                    transformation: { width: 550, height: 309 },
                    type: "png",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 60 },
                children: [
                  new TextRun({
                    text: `Gambar: ${caption}`,
                    size: 18,
                    bold: true,
                    color: COLOR_PRIMARY,
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createCallout(text: string, title = "PETUNJUK PENTING", type = "info") {
  const bgColor = type === "warning" ? "FFFBEB" : type === "success" ? "F0FDF4" : "EFF6FF";
  const borderColor = type === "warning" ? "D97706" : type === "success" ? "16A34A" : "2563EB";
  const titleColor = type === "warning" ? "92400E" : type === "success" ? "166534" : "1E40AF";

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      left: { style: BorderStyle.SINGLE, size: 24, color: borderColor },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: bgColor, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `📌 ${title}: `,
                    bold: true,
                    size: 20,
                    color: titleColor,
                    font: "Calibri",
                  }),
                  new TextRun({
                    text,
                    size: 20,
                    color: COLOR_SECONDARY,
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createStepBox(stepNum: number, stepTitle: string, description: string, details: string[]) {
  const contentParagraphs = [
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: `LANGKAH ${stepNum}: ${stepTitle.toUpperCase()}`,
          bold: true,
          size: 22,
          color: COLOR_PRIMARY,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: description,
          size: 21,
          color: COLOR_SECONDARY,
          font: "Calibri",
        }),
      ],
    }),
  ];

  details.forEach((item) => {
    contentParagraphs.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: item,
            size: 20,
            color: COLOR_SECONDARY,
            font: "Calibri",
          }),
        ],
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 16, color: COLOR_PRIMARY },
      right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: COLOR_BG_LIGHT, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            children: contentParagraphs,
          }),
        ],
      }),
    ],
  });
}

function createStyledTable(headers: string[], rowsData: string[][], colWidths: number[]) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((headerText, idx) => {
      return new TableCell({
        width: { size: colWidths[idx], type: WidthType.PERCENTAGE },
        shading: { fill: COLOR_PRIMARY, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 140, right: 140 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: headerText,
                bold: true,
                size: 20,
                color: "FFFFFF",
                font: "Calibri",
              }),
            ],
          }),
        ],
      });
    }),
  });

  const bodyRows = rowsData.map((row, rIdx) => {
    const bgFill = rIdx % 2 === 0 ? "FFFFFF" : COLOR_BG_LIGHT;
    return new TableRow({
      children: row.map((cellText, cIdx) => {
        return new TableCell({
          width: { size: colWidths[cIdx], type: WidthType.PERCENTAGE },
          shading: { fill: bgFill, type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 140, right: 140 },
          children: [
            new Paragraph({
              alignment: cIdx === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: cellText,
                  size: 19,
                  color: COLOR_SECONDARY,
                  font: "Calibri",
                }),
              ],
            }),
          ],
        });
      }),
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
    },
    rows: [headerRow, ...bodyRows],
  });
}

async function generateManualBook() {
  const logoPath = path.join(__dirname, "../public/Logo-Tapsel.png");
  let logoBuffer: Buffer | null = null;
  if (fs.existsSync(logoPath)) {
    logoBuffer = fs.readFileSync(logoPath);
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22,
            color: COLOR_SECONDARY,
          },
        },
      },
    },
    sections: [
      // ==========================================
      // HALAMAN JUDUL (COVER PAGE)
      // ==========================================
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: [
          new Paragraph({ spacing: { before: 400, after: 300 } }),
          ...(logoBuffer
            ? [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 400 },
                  children: [
                    new ImageRun({
                      data: logoBuffer,
                      transformation: { width: 140, height: 160 },
                      type: "png",
                    }),
                  ],
                }),
              ]
            : []),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "BUKU PETUNJUK OPERASIONAL",
                bold: true,
                size: 36,
                color: COLOR_PRIMARY,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "SISTEM INFORMASI APLIKASI BPHTB ONLINE",
                bold: true,
                size: 28,
                color: COLOR_SECONDARY,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "(Bea Perolehan Hak atas Tanah dan Bangunan)",
                italics: true,
                size: 22,
                color: COLOR_MUTED,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
            children: [
              new TextRun({
                text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                color: COLOR_PRIMARY,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "BADAN PENGELOLAAN KEUANGAN, PENDAPATAN",
                bold: true,
                size: 24,
                color: COLOR_SECONDARY,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "DAN ASET DAERAH (BPKPAD)",
                bold: true,
                size: 24,
                color: COLOR_SECONDARY,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "KABUPATEN TAPANULI SELATAN",
                bold: true,
                size: 26,
                color: COLOR_PRIMARY,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 600 },
            children: [
              new TextRun({
                text: "Edisi Lengkap dengan Tangkapan Layar Aplikasi / Versi 2.0 (2026)",
                size: 20,
                color: COLOR_MUTED,
                font: "Calibri",
              }),
            ],
          }),
        ],
      },

      // ==========================================
      // KONTEN UTAMA MANUAL BOOK BERGAMBAR
      // ==========================================
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Manual Book BPHTB Online — BPKPAD Kab. Tapanuli Selatan",
                    size: 16,
                    color: COLOR_MUTED,
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "BPKPAD Kabupaten Tapanuli Selatan — Aplikasi BPHTB Online 2026", size: 18, color: COLOR_MUTED }),
                ],
              }),
            ],
          }),
        },
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 },
          },
        },
        children: [
          // BAB 1: PENDAHULUAN
          createHeaderBox("BAB I: PENDAHULUAN", "Latar Belakang, Tujuan, dan Ruang Lingkup Aplikasi"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Aplikasi BPHTB Online Kabupaten Tapanuli Selatan ",
                bold: true,
              }),
              new TextRun({
                text: "merupakan platform digital terpadu yang dirancang untuk mengotomatisasi seluruh siklus pemungutan dan pelayanan Pajak Bea Perolehan Hak atas Tanah dan Bangunan (BPHTB). Sistem ini memfasilitasi integrasi antara Wajib Pajak, PPAT/Notaris, Petugas Loket Pelayanan, Tim Verifikator Berjenjang (Level 1, Level 2, Level 3 Penetapan), hingga Kasir Bank Persepsi / Bendahara Penerimaan.",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Tujuan Utama Sistem:",
                bold: true,
                color: COLOR_PRIMARY,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: "Transparansi & Akuntabilitas: ",
                bold: true,
              }),
              new TextRun({
                text: "Menghilangkan potensi manipulasi data nilai NJOP, luas tanah/bangunan, dan tarif dengan perhitungan otomatis berbasis sistem.",
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: "Kecepatan Pelayanan: ",
                bold: true,
              }),
              new TextRun({
                text: "Mengurangi waktu antrean dan proses verifikasi berkas dari hitungan minggu menjadi beberapa jam.",
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: "Validasi Multilevel: ",
                bold: true,
              }),
              new TextRun({
                text: "Menerapkan kontrol 3 lapis verifikasi (Staf Teknis -> Kepala Seksi -> Kepala Bidang) sebelum SKP/SSPD resmi diterbitkan.",
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "Pelaporan Real-time: ",
                bold: true,
              }),
              new TextRun({
                text: "Menyediakan dashboard interaktif, statistik penerimaan kas daerah, rekapitulasi tunggakan piutang, dan cetak laporan resmi.",
              }),
            ],
          }),

          createCallout(
            "Seluruh pengguna wajib menjaga kerahasiaan akun login masing-masing. Jangan membagikan username & password kepada pihak manapun demi menjaga keamanan data wajib pajak daerah.",
            "PERINGATAN KEAMANAN INFORMASI",
            "warning"
          ),

          new Paragraph({ spacing: { before: 300, after: 150 } }),

          // BAB 2: HAK AKSES & PERAN PENGGUNA
          createHeaderBox("BAB II: HAK AKSES DAN MATRIKS WEWENANG", "Struktur Tingkat Akses (Role Based Access Control)"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Sistem membagi pengguna ke dalam 7 (tujuh) tingkat level kewenangan guna memastikan prinsip pemisahan fungsi (Segregation of Duties):",
              }),
            ],
          }),

          createStyledTable(
            ["Level", "Nama Peran (Role)", "Deskripsi Wewenang & Hak Akses", "Akses Fitur Utama"],
            [
              ["1", "Administrator", "Pengelolaan penuh sistem, manajemen user, konfigurasi master data (Kecamatan, Desa, Pejabat, Tarif).", "Semua Menu, Master Data, Log Aktivitas"],
              ["2", "Loket Pelayanan", "Penerimaan berkas fisik/online, registrasi berkas baru, upload berkas persyaratan pemohon.", "Pendaftaran BPHTB, Daftar Berkas Masuk"],
              ["3", "Verifikator 1 (Staf Lapangan)", "Pemeriksaan kelengkapan dokumen, kesesuaian NOP PBB, validasi fisik & luas objek pajak.", "Verifikasi 1 (Pemeriksaan Dokumen)"],
              ["4", "Verifikator 2 (Kasi Teknis)", "Kajian yuridis, validasi nilai NPOP vs NJOP pasar, verifikasi status NPOPTKP & tarif.", "Verifikasi 2 (Analisis Teknis & Yuridis)"],
              ["5", "Verifikator 3 (Kabid Penetapan)", "Pemberian persetujuan final (Approval) dan penerbitan Surat Ketetapan Pajak Daerah (SKPD/SKPDKB).", "Verifikasi 3 & Penetapan SKP Resmi"],
              ["6", "Bank / Kasir Penerima", "Pencatatan pembayaran setoran pajak, validasi bukti transfer/STS, dan penerbitan tanda lunas.", "Kasir Pembayaran BPHTB, Laporan STS"],
              ["7", "PPAT / Notaris", "Pengajuan mandiri permohonan validasi BPHTB atas akta jual beli, hibah, waris, atau tukar menukar.", "Pendaftaran Mandiri & Tracking Status"],
            ],
            [10, 25, 40, 25]
          ),

          new Paragraph({ spacing: { before: 300, after: 150 } }),

          // BAB 3: PETUNJUK LOGIN & AKSES SISTEM
          createHeaderBox("BAB III: PETUNJUK MASUK SISTEM (LOGIN)", "Panduan Akses Aplikasi & Keamanan Akun"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          createImageBox("01_halaman_login.png", "Antarmuka Halaman Login BPHTB Online BPKPAD Tapsel"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          createStepBox(
            1,
            "Membuka Alamat Web Aplikasi",
            "Akses aplikasi melalui peramban web (Google Chrome / Mozilla Firefox / Microsoft Edge terbaru).",
            [
              "Buka peramban dan ketik alamat URL aplikasi resmi BPKPAD Tapsel.",
              "Pastikan koneksi internet stabil dan aman.",
              "Halaman antarmuka login BPHTB Online Tapsel dengan nuansa maroon khas daerah akan terbuka.",
            ]
          ),
          new Paragraph({ spacing: { before: 150, after: 150 } }),
          createStepBox(
            2,
            "Memasukkan Kredensial Pengguna",
            "Masukkan Username dan Password resmi yang telah didaftarkan oleh Administrator.",
            [
              "Ketik Username pada kolom yang tersedia.",
              "Ketik Password akun Anda. Klik ikon mata jika ingin melihat karakter password.",
              "Klik tombol 'Masuk ke Sistem' berwarna merah marun.",
              "Sistem akan memvalidasi data dan mengarahkan Anda langsung ke Dashboard Utama sesuai peran pengguna.",
            ]
          ),

          new Paragraph({ spacing: { before: 300, after: 150 } }),

          // BAB 4: DASHBOARD & STATISTIK
          createHeaderBox("BAB IV: DASHBOARD & MONITORING REAL-TIME", "Fitur Ringkasan Eksekutif dan Grafik Kinerja"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          createImageBox("02_dashboard_utama.png", "Tampilan Dashboard Utama, KPI Penerimaan, dan Grafik Statistik"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Setelah berhasil login, pengguna disajikan Dashboard Interaktif yang memuat informasi statistik secara langsung:",
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Filter Tahun Anggaran: ", bold: true }),
              new TextRun({ text: "Memungkinkan pengguna memfilter data penerimaan berdasarkan tahun anggaran berjalan atau tahun-tahun sebelumnya." }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Kartu Indikator Utama (KPI Cards): ", bold: true }),
              new TextRun({ text: "Menampilkan Total Berkas Terdaftar, Berkas Menunggu Verifikasi, Berkas Disetujui, Berkas Lunas Bayar, serta Total Realisasi Penerimaan BPHTB (Rp)." }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Grafik Tren Bulanan: ", bold: true }),
              new TextRun({ text: "Grafik batang/garis interaktif yang menunjukkan perbandingan target vs realisasi penerimaan per bulan." }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 200 },
            children: [
              new TextRun({ text: "Tabel Berkas Terbaru: ", bold: true }),
              new TextRun({ text: "Daftar 6 berkas mutakhir yang baru saja masuk ke sistem beserta status prosesnya saat ini." }),
            ],
          }),

          // BAB 5: FORMULIR PENDAFTARAN & PERHITUNGAN
          createHeaderBox("BAB V: MODUL PENDAFTARAN BERKAS BPHTB", "Panduan Pengisian Formulir Step-by-Step"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          createImageBox("03_pendaftaran_wp_lama.png", "Formulir Wizard Pendaftaran BPHTB Multi-Langkah"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Modul pendaftaran BPHTB dirancang dengan konsep Wizard Multi-Tahap (5 Langkah Terstruktur) untuk memudahkan pengguna dan mencegah kesalahan input:",
              }),
            ],
          }),

          createStepBox(
            1,
            "Tahap 1: Data Wajib Pajak Lama (Penjual / Pemilik Asal)",
            "Pengisian identitas pihak yang mengalihkan hak atas tanah/bangunan.",
            [
              "Nama Lengkap Wajib Pajak Lama (sesuai KTP).",
              "NIK / Nomor Paspor / Dokumen Kependudukan (16 digit).",
              "NPWP Wajib Pajak Lama (bila ada).",
              "Alamat Lengkap, RT/RW, Kelurahan/Desa, Kecamatan, Kota/Kabupaten, dan Nomor Telepon Aktif.",
            ]
          ),
          new Paragraph({ spacing: { before: 150, after: 150 } }),
          createStepBox(
            2,
            "Tahap 2: Data Wajib Pajak Baru (Pembeli / Penerima Hak)",
            "Pengisian identitas pihak yang memperoleh hak atas tanah/bangunan.",
            [
              "Nama Lengkap Penerima Hak (Wajib Pajak Baru).",
              "NIK / Nomor Identitas Pemilik Baru.",
              "NPWP Wajib Pajak Baru.",
              "Alamat Lengkap Domisili, RT/RW, Desa, Kecamatan, dan No. Kontak yang dapat dihubungi.",
            ]
          ),
          new Paragraph({ spacing: { before: 150, after: 150 } }),
          createStepBox(
            3,
            "Tahap 3: Data Objek Pajak (NOP PBB)",
            "Pencarian otomatis dan pengisian detail tanah & bangunan.",
            [
              "Fitur Auto-Lookup NOP: Masukkan 18 digit Nomor Objek Pajak (NOP) PBB, lalu klik 'Cari Data PBB'. Sistem otomatis mengisi Luas Tanah, Luas Bangunan, NJOP Bumi, dan NJOP Bangunan.",
              "Bila data NOP tidak ditemukan di server PBB, masukkan rincian luas dan NJOP per meter secara manual.",
              "Sistem menghitung Total NJOP Bumi, Total NJOP Bangunan, dan Total Nilai PBB secara instan.",
            ]
          ),
          new Paragraph({ spacing: { before: 150, after: 150 } }),
          createStepBox(
            4,
            "Tahap 4: Transaksi & Kalkulasi BPHTB Otomatis",
            "Pemilihan jenis perolehan hak dan rumus perhitungan pajak otomatis.",
            [
              "Pilih Jenis Transaksi (Jual Beli, Hibah, Waris, Hibah Wasiat, Pemisahan Hak, dll).",
              "Masukkan Nilai Transaksi / Nilai Pasar (Rp).",
              "Sistem otomatis membandingkan Nilai Transaksi dengan Total NJOP PBB. Nilai tertinggi ditetapkan sebagai NPOP (Nilai Perolehan Objek Pajak).",
              "Sistem otomatis mengurangkan NPOPTKP (Nilai Perolehan Objek Pajak Tidak Kena Pajak, default Rp 80.000.000 untuk Jual Beli / Rp 300.000.000 untuk Waris).",
              "Menghitung NPOPKP (NPOP Kena Pajak) = NPOP - NPOPTKP.",
              "Menghitung Pajak BPHTB Terutang = NPOPKP x Tarif 5% (atau sesuai jenis transaksi).",
              "Opsi SKPDKB: Mendukung penetapan Kurang Bayar jika ada kekurangan dari ketetapan sebelumnya.",
            ]
          ),
          new Paragraph({ spacing: { before: 150, after: 150 } }),
          createStepBox(
            5,
            "Tahap 5: Unggah Dokumen Lampiran & Simpan Berkas",
            "Pengunggahan berkas bukti autentik pendukung permohonan.",
            [
              "Unggah Scan Surat Pernyataan Wajib Pajak (Format PDF/JPG/PNG).",
              "Unggah Scan KTP Pemohon / Penerima Hak.",
              "Unggah Foto Fisik Lokasi Objek Pajak di Lapangan.",
              "Unggah Scan NPWP, Bukti Lunas PBB Tahun Berjalan, dan Scan Sertifikat Tanah / Alas Hak.",
              "Klik tombol 'Simpan & Daftarkan Berkas'. Sistem akan menerbitkan Nomor Berkas Resmi secara otomatis.",
            ]
          ),

          new Paragraph({ spacing: { before: 300, after: 150 } }),

          // FORMULA BPHTB SUMMARY TABLE
          createHeaderBox("RUMUS & FORMULA PERHITUNGAN BPHTB", "Standardisasi Berdasarkan UU HKPD No. 1 Tahun 2022 & Perda"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          createStyledTable(
            ["Komponen Perhitungan", "Formula / Rumus Matematika", "Keterangan"],
            [
              ["Total NJOP Objek", "(Luas Bumi x NJOP/m²) + (Luas Bangunan x NJOP/m²)", "Total nilai dasar PBB-P2"],
              ["NPOP", "MAX(Nilai Transaksi Riil, Total NJOP Objek)", "Dasar pengenaan pajak dipilih yang tertinggi"],
              ["NPOPTKP", "Sesuai Perda (Standar Rp 80 Jt, Waris Rp 300 Jt)", "Batas nilai tidak kena pajak untuk perolehan pertama"],
              ["NPOPKP", "NPOP - NPOPTKP", "Dasar pengalian tarif pajak (Jika minus, maka Rp 0)"],
              ["BPHTB Terutang", "NPOPKP x Tarif (5%)", "Total kewajiban pajak yang harus disetorkan"],
            ],
            [25, 45, 30]
          ),

          new Paragraph({ spacing: { before: 300, after: 150 } }),

          // BAB 6: VERIFIKASI BERJENJANG 3 LEVEL
          createHeaderBox("BAB VI: ALUR VERIFIKASI BERJENJANG (3 LEVEL)", "SOP Pemeriksaan, Penelaahan, dan Penetapan SKP"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          createImageBox("04_verifikasi_level1.png", "Antarmuka Modul Verifikasi Berkas Level 1"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Untuk menjamin integritas data dan mencegah kebocoran pendapatan asli daerah, berkas yang didaftarkan wajib melewati 3 (tiga) tahapan persetujuan sistem:",
              }),
            ],
          }),

          createStyledTable(
            ["Tahap Verifikasi", "Petugas Bertanggung Jawab", "Objek Pemeriksaan", "Aksi Tindakan"],
            [
              [
                "Level 1: Verifikasi Berkas & Lapangan",
                "Staf Pemeriksa Loket & Lapangan",
                "1. Kelengkapan upload KTP, Sertifikat, PBB.\n2. Kesesuaian fisik objek dengan foto lapangan.\n3. Kebenaran 18 digit NOP.",
                "• Setujui (Lanjut ke Verif 2)\n• Tolak / Kembalikan dengan Catatan Revisi"
              ],
              [
                "Level 2: Verifikasi Teknis & Yuridis",
                "Kepala Seksi (Kasi) Pelayanan / Teknis",
                "1. Validasi yuridis jenis hak & jenis transaksi.\n2. Kewajaran harga transaksi vs zona nilai tanah.\n3. Hak perolehan fasilitas NPOPTKP pemohon.",
                "• Setujui (Lanjut ke Verif 3)\n• Tolak / Minta Koreksi ke Verif 1"
              ],
              [
                "Level 3: Verifikasi Penetapan SKP",
                "Kepala Bidang (Kabid) Pendapatan / Penetapan",
                "1. Otorisasi penetapan formal SKPD/SKPDKB.\n2. Pembubuhan Tanda Tangan Elektronik / Kohir.\n3. Penerbitan Kode Bayar / Nomor STS resmi.",
                "• Setujui & Terbitkan SKPD Resmi\n• Batalkan / Tolak Berkas"
              ]
            ],
            [20, 25, 35, 20]
          ),

          new Paragraph({ spacing: { before: 300, after: 150 } }),

          // BAB 7: PEMBAYARAN, STS & BUKTI LUNAS
          createHeaderBox("BAB VII: MODUL PEMBAYARAN & PENERBITAN SSPD", "Pencatatan Setoran Kas, Validasi Bank, dan Cetak SSPD"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          createImageBox("05_modul_pembayaran.png", "Modul Kasir Pembayaran BPHTB dan Cetak SSPD Lunas"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Setelah berkas memperoleh status 'Disetujui Level 3 (SKP Terbit)', Wajib Pajak dapat melakukan pembayaran melalui Bank Persepsi (Bank Sumut, Bank Mandiri, BRI, BNI, BCA, dll) atau melalui Kasir Loket BPKPAD.",
              }),
            ],
          }),

          createStepBox(
            1,
            "Pencatatan Pembayaran oleh Kasir / Petugas Bank",
            "Prosedur pelunasan pajak BPHTB di sistem:",
            [
              "Buka Menu 'Pembayaran BPHTB' di sidebar samping.",
              "Cari berkas berdasarkan No. Berkas, Nama Wajib Pajak, atau NOP pada tab 'Belum Lunas'.",
              "Klik tombol 'Bayar / Catat Setoran'.",
              "Pilih Bank Pembayaran (misal: Bank Sumut / Bank Sumut Syariah / Kasir BPKPAD).",
              "Masukkan Nomor Bukti Pembayaran / Ref Bank dan Tanggal Setoran.",
              "Masukkan Jumlah Setoran (harus sesuai dengan nilai ketetapan BPHTB terutang).",
              "Klik 'Konfirmasi Pembayaran Lunas'. Status berkas langsung berganti menjadi 'Lunas'.",
            ]
          ),
          new Paragraph({ spacing: { before: 150, after: 150 } }),
          createStepBox(
            2,
            "Pencetakan Dokumen Surat Setoran Pajak Daerah (SSPD)",
            "Penerbitan bukti lunas legal untuk syarat pendaftaran di Kantor Pertanahan (BPN):",
            [
              "Pindah ke tab 'Sudah Lunas' pada menu Pembayaran BPHTB.",
              "Klik tombol 'Cetak SSPD' pada berkas yang bersangkutan.",
              "Sistem akan mengunduh dokumen SSPD resmi 5 Lembar berstandar format cetak dinas lengkap dengan stempel validasi lunas dan barcode verifikasi keaslian dokumen.",
            ]
          ),

          new Paragraph({ spacing: { before: 300, after: 150 } }),

          // BAB 8: MODUL LAPORAN & REKAPITULASI
          createHeaderBox("BAB VIII: MODUL LAPORAN & EKSPOR DATA", "Cetak Rekapitulasi Realisasi, Piutang, dan Transaksi"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          createImageBox("06_modul_laporan.png", "Halaman Rekapitulasi Laporan Pembayaran dan Realisasi Pajak"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Aplikasi menyediakan menu 'Laporan' komprehensif untuk kebutuhan evaluasi pimpinan dan audit Badan Pemeriksa Keuangan (BPK):",
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Laporan Pendaftaran: ", bold: true }),
              new TextRun({ text: "Daftar seluruh berkas permohonan yang masuk per rentang tanggal atau per wilayah kecamatan." }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Laporan Verifikasi: ", bold: true }),
              new TextRun({ text: "Monitoring progres verifikasi berkas pada masing-masing tingkatan (Level 1, 2, 3)." }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Laporan Ketetapan SKP: ", bold: true }),
              new TextRun({ text: "Rekapitulasi total ketetapan pokok pajak terutang, nomor kohir, dan tanggal jatuh tempo." }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Laporan Penerimaan / Realisasi Pembayaran: ", bold: true }),
              new TextRun({ text: "Laporan kas riil yang masuk ke Kas Daerah berdasarkan nomor STS dan bank penerima." }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "Laporan Piutang BPHTB: ", bold: true }),
              new TextRun({ text: "Daftar berkas ketetapan yang telah melewati jatuh tempo namun belum dilunasi oleh Wajib Pajak." }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 200 },
            children: [
              new TextRun({ text: "Ekspor Format PDF & Excel: ", bold: true }),
              new TextRun({ text: "Semua tabel laporan dapat langsung dicetak atau diekspor ke format dokumen resmi siap pakai." }),
            ],
          }),

          // BAB 9: MASTER DATA & PENGATURAN
          createHeaderBox("BAB IX: MASTER DATA & KONFIGURASI SISTEM", "Pengelolaan Data Referensi Wilayah, Tarif, Pejabat & Akun Pengguna"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          createImageBox("07_master_pengguna.png", "Halaman Pengelolaan Akun Pengguna dan Hak Akses RBAC"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Menu Master Data hanya dapat diakses oleh pengguna dengan level Administrator untuk menjaga standardisasi referensi sistem:",
              }),
            ],
          }),
          createStyledTable(
            ["Menu Master", "Fungsi & Objek Pengaturan", "Dampak Terhadap Sistem"],
            [
              ["Master Kecamatan & Desa", "Menambah, mengedit, atau menonaktifkan kode referensi 15 Kecamatan dan 238 Desa di Tapanuli Selatan.", "Mempengaruhi dropdown pemilihan wilayah pada pendaftaran dan filter laporan."],
              ["Master Jenis Transaksi", "Mengatur daftar jenis perolehan hak (Jual Beli, Hibah, Waris), besaran NPOPTKP, dan tarif dasar.", "Menentukan formula kalkulasi pajak otomatis di form pendaftaran."],
              ["Master Pejabat Penandatangan", "Mengisi Nama, NIP, Jabatan, dan Pangkat Kepala Badan, Kabid Penetapan, dan Kasubbid.", "Otomatis dicetak pada lembar SKPD, SSPD, dan laporan resmi."],
              ["Master Pengguna (Users)", "Membuat akun baru, mereset password staf, mengubah hak akses level 1 s.d 7, serta memblokir akun nonaktif.", "Mengatur keamanan dan wewenang operasional setiap pegawai/PPAT."]
            ],
            [25, 45, 30]
          ),

          new Paragraph({ spacing: { before: 300, after: 150 } }),

          // BAB 10: TROUBLESHOOTING & FAQ
          createHeaderBox("BAB X: PANDUAN PENANGANAN MASALAH (TROUBLESHOOTING)", "Solusi Kendala Operasional yang Sering Dihadapi"),
          new Paragraph({ spacing: { before: 200, after: 150 } }),
          createStyledTable(
            ["Gejala / Masalah", "Penyebab Umum", "Langkah Solusi / Tindakan"],
            [
              ["Gagal Login / 'Kredensial Tidak Valid'", "Salah ketik username/password, atau akun terblokir statusnya.", "1. Periksa huruf besar/kecil (Caps Lock).\n2. Hubungi Administrator untuk verifikasi status keaktifan user atau reset password."],
              ["Lookup NOP PBB Tidak Menampilkan Data", "Koneksi ke database server PBB terputus atau format NOP salah.", "1. Periksa kembali 18 digit NOP tanpa tanda titik/strip.\n2. Jika server PBB offline, lakukan input rincian luas & NJOP secara manual."],
              ["Gagal Upload Dokumen Lampiran", "Ukuran file melebihi batas maksimal (5 MB) atau format bukan PDF/JPG.", "1. Kompres ukuran file dokumen terlebih dahulu.\n2. Pastikan file berformat .pdf, .jpg, atau .png."],
              ["Tombol 'Setujui' Tidak Aktif di Verifikasi", "Pengguna login dengan peran yang tidak sesuai dengan level verifikasi berkas saat ini.", "Pastikan login dengan akun verifikator yang tepat (Verif 1 untuk staf, Verif 2 untuk kasi, Verif 3 untuk kabid)."],
              ["Koneksi Database Timeout / Error 500", "Koneksi internet terputus atau server PostgreSQL sedang maintenance.", "Periksa koneksi jaringan internet komputer Anda lalu refresh browser (Ctrl + F5). Hubungi tim IT jika berlanjut."]
            ],
            [25, 35, 40]
          ),

          new Paragraph({ spacing: { before: 300, after: 200 } }),
          createCallout(
            "Untuk bantuan teknis dan dukungan darurat operasional, silakan hubungi Tim IT BPKPAD Kabupaten Tapanuli Selatan atau kirimkan tiket bantuan melalui Administrator Sistem.",
            "LAYANAN DUKUNGAN TEKNIS (HELP DESK)",
            "info"
          ),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, "../MANUAL_BOOK_BPHTB_ONLINE_TAPSEL.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log("Manual Book DOCX with Real Screenshots generated successfully at: " + outputPath);
}

generateManualBook().catch((err) => {
  console.error("Error generating docx:", err);
});
