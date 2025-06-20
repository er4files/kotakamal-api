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

    // Gunakan waktu sekarang tanpa manipulasi (asumsikan server sudah WIB atau gunakan timeZone saat format)
    const currentDate = new Date();

    // Konversi ke Firestore Timestamp
    const timestamp = admin.firestore.Timestamp.fromDate(currentDate);

    // Format waktu lokal Asia/Jakarta (WIB) untuk log dan response
    const jakartaDateLog = currentDate.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    // Simpan ke Firestore
    await db.collection("history_kotak_amal").add({
      nominal_uang: Number(nominal_uang),
      timestamp: timestamp
    });

    console.log(`✅ Data berhasil disimpan: Rp ${nominal_uang} pada ${jakartaDateLog}`);

    // Kirim response sukses dengan detail
    return res.status(200).json({
      success: true,
      message: `Data berhasil dikirim! Nominal: Rp ${nominal_uang} pada ${jakartaDateLog}`
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
