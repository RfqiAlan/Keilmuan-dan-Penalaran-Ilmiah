const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Configure Nodemailer transport
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email notification to the admin about a new user registration.
 * @param {Object} newUser - The newly registered user object
 */
const notifyAdminNewUser = async (newUser) => {
  // If SMTP is not configured, silently skip to avoid breaking registration
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ Notifikasi admin dilewati: SMTP_USER atau SMTP_PASS belum disetel di .env");
    return;
  }

  const mailOptions = {
    from: `"SIMPAR UKM" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER, // Sends email to itself (the admin email)
    subject: "🚨 Pendaftaran Anggota Baru - Menunggu Verifikasi",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #28517E; color: #fff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Pendaftaran Anggota Baru</h2>
        </div>
        <div style="padding: 20px;">
          <p>Halo Admin,</p>
          <p>Terdapat anggota baru yang mendaftar di sistem SIMPAR UKM dan akunnya sedang dalam status <strong>Menunggu Verifikasi (Pending)</strong>.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Nama</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${newUser.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${newUser.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">No. HP</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${newUser.phone || "-"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Role Diajukan</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-transform: capitalize;">${newUser.role}</td>
            </tr>
          </table>

          <p>Anggota tersebut telah mengunggah file Kartu Tanda Anggota (KTA) ke Google Drive.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL}/admin/users" style="background-color: #4EA8DE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Cek & Verifikasi Akun
            </a>
          </div>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          Email otomatis dari Sistem Informasi Peminjaman dan Arsip (SIMPAR) UKM
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email notifikasi admin terkirim:", info.messageId);
  } catch (error) {
    console.error("❌ Gagal mengirim email notifikasi admin:", error.message);
  }
};

module.exports = { notifyAdminNewUser };
