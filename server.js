import express from 'express';
import cors from 'cors';
import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';

// Memuat konfigurasi dari berkas .env
dotenv.config();

const app = express();

// Mengizinkan frontend mengakses backend ini meskipun berbeda port/asal
app.use(cors());
app.use(express.json());

// Inisialisasi Groq Client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// DATA KONTEKS UTAMA (Tanpa informasi Portofolio agar AI fokus pada Paket)
const SYNTAKSWEB_CONTEXT = `
Nama Jasa: SyntaksWeb
Slogan: Solusi Website Hemat & Profesional untuk UMKM (While alive, we build).
Link WhatsApp Resmi: [Chat WhatsApp](https://wa.me/6289630463001)

Daftar Paket Harga & Fitur:
1. Paket Hemat: 
   - Harga Promo: Rp 200.000 (Harga normal Rp 499.000)
   - Fitur: Landing Page (1 Halaman), Aktif 1 Tahun, Domain .biz.id / .my.id, Tombol WhatsApp Langsung, Mobile Responsive, Revisi 1x.
2. Paket Bisnis (Rekomendasi):
   - Harga Promo: Rp 1.000.000 (Harga normal Rp 1.200.000)
   - Fitur: Up to 5 Halaman, Aktif 1 Tahun, Domain .com, Integrasi Google Maps & WhatsApp, Optimasi SEO Dasar, Maintenance 1 Bulan.
3. Paket Custom:
   - Harga Promo: Rp 3.500.000 (Harga normal Rp 5.000.000)
   - Fitur: Fitur Khusus (Invoice Otomatis), Aktif 1 Tahun, Custom Domain, Database & Dashboard, Unlimited Pages, Widget Review Google Maps (Opsional), Priority Support.

Layanan Utama:
- Profil UMKM (Memperkenalkan produk ke pasar luas)
- Company Profile (Meningkatkan rasa percaya klien)
- Mobile Ready (Website otomatis rapi di HP/Laptop)
`;

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Anda adalah Chatbot FAQ resmi dari SyntaksWeb yang ramah, profesional, dan jujur.
                    
                    FOKUS UTAMA: 
                    Bantu calon klien memahami dan memilih paket harga yang paling sesuai dengan kebutuhan mereka. JANGAN PERNAH menyebutkan, membahas, atau menawarkan portofolio atau contoh website apa pun. Fokuslah murni pada penjelasan detail fitur dan harga paket secara singkat dan tidak berlebihan.

                    Panduan Membantu Klien Memilih Paket:
                    - Jika klien bingung atau bertanya tentang pilihan paket ("manual" vs "otomatis/rekomendasi"), jelaskan bahwa Paket Hemat cocok untuk landing page cepat/otomatis siap pakai, sedangkan Paket Bisnis adalah rekomendasi terbaik dengan domain .com dan optimasi lengkap. Jika butuh kustomisasi manual yang kompleks, arahkan ke Paket Custom atau WhatsApp.
                    
                    ---
                    ${SYNTAKSWEB_CONTEXT}
                    ---
                    
                    ATURAN KETAT KEAMANAN & ANTI-HALU (WAJIB DIPATUHI):
                    1. JANGAN PERNAH MENULISKAN NOMOR TELEPON ATAU ANGKA HP (seperti 0896..., 6289...) secara mentah dalam jawaban Anda! Ini demi keamanan privasi pemilik.
                    2. JANGAN PERNAH menyebutkan kata "Toko Sapto" atau informasi portofolio lainnya. Abaikan sepenuhnya data portofolio jika ada yang menanyakan.
                    3. Jika Anda perlu mengarahkan pengguna ke WhatsApp atau jika ada pertanyaan di luar detail paket yang tidak Anda ketahui jawabannya, Anda WAJIB menjawab dengan mengarahkan mereka menggunakan format link markdown ini persis dengan tombol kliknya: "[Chat WhatsApp](https://wa.me/6289630463001)" tapi jangan tampilkan nomor telepon atau link api wa mentahnya.
                    4. JIKA pertanyaan user TIDAK ADA di dalam data konteks paket di atas, katakan secara jujur bahwa fitur/pilihan tersebut tidak tersedia di paket standar, lalu arahkan mereka untuk konsultasi manual lewat link WhatsApp di atas.
                    5. Jawab dengan singkat, padat, dan gunakan bahasa Indonesia yang santun namun santai.`
                },
                {
                    role: "user",
                    content: message
                }
            ],
            model: "llama-3.1-8b-instant", 
            temperature: 0.1, 
            max_tokens: 800
        });

        const reply = chatCompletion.choices[0]?.message?.content || "Maaf, silakan tanyakan kembali.";
        res.json({ reply });

    } catch (error) {
        console.error("Groq Error:", error);
        res.status(500).json({ reply: "Koneksi sedang terganggu. Silakan konsultasi langsung dengan kami: [Chat WhatsApp](https://wa.me/6289630463001)" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server SyntaksWeb berjalan aman di port ${PORT}`));