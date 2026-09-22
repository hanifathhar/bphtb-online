import puppeteer from "puppeteer";
import * as fs from "fs";
import * as path from "path";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-super-aman-bphtb-2026";

async function captureScreenshotsWithAuth() {
  const screenshotsDir = path.join(__dirname, "../public/manual-book-img");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const token = jwt.sign(
    {
      id: 1,
      username: "admin",
      nama: "Administrator Utama",
      level: 1,
      roleName: "ADMIN",
      email: "admin@tapsel.go.id",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  console.log("Launching headless browser with token...");
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1366, height: 768 },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // 1. Screenshot Login Page
  console.log("Navigating to Login Page...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(screenshotsDir, "01_halaman_login.png"),
    fullPage: false,
  });
  console.log("Captured 01_halaman_login.png");

  // Set Cookie for authenticated pages
  await page.setCookie({
    name: "token",
    value: token,
    domain: "localhost",
    path: "/",
    httpOnly: false,
    secure: false,
  });

  // Evaluate localStorage as well
  await page.evaluate((tok) => {
    localStorage.setItem("token", tok);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 1,
        username: "admin",
        nama: "Administrator Utama",
        level: 1,
        roleName: "ADMIN",
      })
    );
  }, token);

  // 2. Screenshot Dashboard
  console.log("Capturing Dashboard...");
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(screenshotsDir, "02_dashboard_utama.png"),
    fullPage: false,
  });
  console.log("Captured 02_dashboard_utama.png");

  // 3. Screenshot Pendaftaran Form
  console.log("Capturing Pendaftaran Form...");
  await page.goto("http://localhost:3000/bphtb/pendaftaran", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(screenshotsDir, "03_pendaftaran_wp_lama.png"),
    fullPage: false,
  });
  console.log("Captured 03_pendaftaran_wp_lama.png");

  // 4. Screenshot Verifikasi 1
  console.log("Capturing Verifikasi 1 Page...");
  await page.goto("http://localhost:3000/bphtb/verifikasi-1", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(screenshotsDir, "04_verifikasi_level1.png"),
    fullPage: false,
  });
  console.log("Captured 04_verifikasi_level1.png");

  // 5. Screenshot Pembayaran / Kasir
  console.log("Capturing Pembayaran Page...");
  await page.goto("http://localhost:3000/bphtb/pembayaran", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(screenshotsDir, "05_modul_pembayaran.png"),
    fullPage: false,
  });
  console.log("Captured 05_modul_pembayaran.png");

  // 6. Screenshot Laporan
  console.log("Capturing Laporan Page...");
  await page.goto("http://localhost:3000/laporan/pembayaran", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(screenshotsDir, "06_modul_laporan.png"),
    fullPage: false,
  });
  console.log("Captured 06_modul_laporan.png");

  // 7. Screenshot Master Data
  console.log("Capturing Master Data Page...");
  await page.goto("http://localhost:3000/master-data/pengguna", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(screenshotsDir, "07_master_pengguna.png"),
    fullPage: false,
  });
  console.log("Captured 07_master_pengguna.png");

  await browser.close();
  console.log("All UI screenshots successfully refreshed with real pages!");
}

captureScreenshotsWithAuth();
