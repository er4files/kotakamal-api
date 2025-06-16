const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Ambil konfigurasi Firebase dari environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

// Inisialisasi Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Endpoint untuk kirim data kotak amal ke Firestore
app.post("/api/kirimdata", async (req, res) => {
  try {
    console.log("📥 Data diterima:", req.body);

    const { nominal_uang } = req.body;

    // Validasi nominal_uang
    if (nominal_uang === undefined || isNaN(Number(nominal_uang))) {
      return res.status(400).json({
        success: false,
        message: "Field 'nominal_uang' wajib diisi dan harus berupa angka"
      });
    }

    // Ambil waktu UTC sekarang
    const nowUtc = new Date();

    // Geser waktu ke zona WIB (UTC+7)
    const offsetWIB = 7 * 60; // 7 jam dalam menit
    const wibTime = new Date(nowUtc.getTime() + offsetWIB * 60 * 1000);

    // Konversi ke Firestore Timestamp
    const timestamp = admin.firestore.Timestamp.fromDate(wibTime);

    // Logging waktu dalam format lokal (untuk debug/log)
    const jakartaDateLog = wibTime.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

    // Simpan ke Firestore
    await db.collection("history_kotak_amal").add({
      nominal_uang: Number(nominal_uang),
      timestamp: timestamp
    });

    console.log("✅ Data berhasil disimpan pada:", jakartaDateLog);

    return res.status(200).json({
      success: true,
      message: "Data kotak amal berhasil disimpan ke Firestore"
    });

  } catch (error) {
    console.error("❌ Error menyimpan data:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Jalankan server di port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});
