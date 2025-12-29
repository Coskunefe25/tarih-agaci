const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const sequelize = require('./db'); 
const { Lider, Devlet, Kategori, KategoriOgesi, Kullanici, KullaniciIlerleme, KonuQuiz, GunlukGorevLog} = require('./models');

// --- YAPAY ZEKA AYARLARI ---
const genAI = new GoogleGenerativeAI("AIzaSyD6gUuqgEBLTDMYNfsro-8Iuy-r384swQw");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- SAYFA ROTALARI ---

// 1. ANASAYFA
app.get('/', async (req, res) => {
    try {
        const liderler = await Lider.findAll({ order: [['sira_no', 'ASC']] });
        const devletler = await Devlet.findAll({ order: [['sira_no', 'ASC']] });
        const kategoriler = await Kategori.findAll();
        const kategoriOgeleri = await KategoriOgesi.findAll({ order: [['sira_no', 'ASC']] });
        
        const top100 = await Kullanici.findAll({
            attributes: ['kadi', 'ad', 'soyad', 'puan'],
            order: [['puan', 'DESC']],
            limit: 100
        });
        
        res.render('index', { 
            baslik: "Tarih Ağacı",
            liderler, devletler, kategoriler, kategoriOgeleri, enIyiler: top100
        });
    } catch (err) {
        console.error("Anasayfa hatası:", err);
        res.status(500).send("Veritabanı hatası: " + err.message);
    }
});

// 2. ADMIN PANELI
app.get('/admin', async (req, res) => {
    try {
        const kategoriler = await Kategori.findAll();
        const liderler = await Lider.findAll({ order: [['id', 'DESC']] });
        const devletler = await Devlet.findAll({ order: [['id', 'DESC']] });
        const ogeler = await KategoriOgesi.findAll({ order: [['id', 'DESC']] });
        const kullanicilar = await Kullanici.findAll({ order: [['id', 'DESC']] });

        res.render('admin', { kategoriler, liderler, devletler, ogeler, kullanicilar });
    } catch (err) {
        res.send("Admin paneli hatası: " + err.message);
    }
});

// --- API ROTALARI (Frontend İstekleri İçin) ---

// 3. KAYIT OL
app.post('/api/kayit', async (req, res) => {
    try {
        await Kullanici.create(req.body);
        res.json({ message: "Kayıt başarılı!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. GİRİŞ YAP
app.post('/api/giris', async (req, res) => {
    try {
        const user = await Kullanici.findOne({ where: { kadi: req.body.kadi, sifre: req.body.sifre } });
        if (user) res.json({ success: true, user: user });
        else res.status(401).json({ success: false, message: "Hatalı giriş!" });
    } catch (err) { res.status(500).json({ success: false, message: "Sunucu hatası!" }); }
});
// server.js içine eklenecek

// ŞİFRE DEĞİŞTİRME API
app.post('/api/sifre-degistir', async (req, res) => {
    const { id, eskiSifre, yeniSifre } = req.body;
    
    try {
        const user = await Kullanici.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });
        }

        // Eski şifre kontrolü (Senin sisteminde şifreler düz metin tutulduğu için direkt karşılaştırıyoruz)
        if (user.sifre !== eskiSifre) {
            return res.status(400).json({ success: false, message: "Eski şifreniz hatalı!" });
        }

        // Yeni şifreyi kaydet
        user.sifre = yeniSifre;
        await user.save();

        res.json({ success: true, message: "Şifreniz başarıyla güncellendi." });

    } catch (err) {
        console.error("Şifre değiştirme hatası:", err);
        res.status(500).json({ success: false, message: "Sunucu hatası oluştu." });
    }
});

// 5. DETAY GETİR (AI DESTEKLİ)
app.post('/api/detay-getir-veya-olustur', async (req, res) => {
    const { id, tip } = req.body; 
    try {
        let Model;
        if (tip === 'lider') Model = Lider;
        else if (tip === 'devlet') Model = Devlet;
        else Model = KategoriOgesi;

        const kayit = await Model.findByPk(id);
        if (!kayit) return res.status(404).json({ error: "Kayıt bulunamadı." });

        if (kayit.detay && kayit.detay.length > 50) {
            return res.json({ icerik: kayit.detay });
        }

        console.log("Detay boş, AI üretiyor...");
        const prompt = `Tarih konusu: ${kayit.ad || kayit.baslik}. Bu konu hakkında detaylı, HTML formatında (h4, p, ul, li, div class='alert alert-info' kullanarak) güzel bir ders içeriği hazırla.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const yeniIcerik = response.text();

        kayit.detay = yeniIcerik;
        await kayit.save();
        
        res.json({ icerik: yeniIcerik });

    } catch (err) {
        console.error("Detay hatası:", err);
        res.status(500).json({ error: err.message });
    }
});

// 6. QUIZ SORULARINI GETİR
app.get('/api/quiz/:tip/:id', async (req, res) => {
    try {
        const { tip, id } = req.params;
        const sorular = await KonuQuiz.findAll({
            where: { konu_tipi: tip, konu_id: id }
        });
        res.json(sorular);
    } catch (err) {
        console.error("Quiz getirme hatası:", err);
        res.status(500).json({ error: "Sorular yüklenirken hata oluştu." });
    }
});

// 7. DERS/QUIZ TAMAMLA (Puan ve İlerleme Kaydet)
// server.js içindeki /api/tamamla rotasını bul ve bununla değiştir:
app.post('/api/tamamla', async (req, res) => {
    // Gelen verileri alıyoruz
    const { kullaniciId, tip, id, puan } = req.body;
    console.log("Tamamlama isteği geldi:", req.body);

    try {
        // ID'lerin sayı olduğundan emin olalım (ParseInt ekledik)
        await KullaniciIlerleme.findOrCreate({
            where: { 
                kullanici_id: parseInt(kullaniciId), 
                konu_tipi: tip, 
                konu_id: parseInt(id) 
            },
            defaults: { tamamlandi: true }
        });

        // Puanı ekle
        const user = await Kullanici.findByPk(parseInt(kullaniciId));
        if (user) {
            // Puanı güvenli bir şekilde artır
            user.puan = (user.puan || 0) + parseInt(puan);
            await user.save();
        }

        res.json({ success: true, mesaj: "İlerleme ve puan kaydedildi." });
    } catch (err) {
        console.error("Tamamlama hatası:", err); // Konsola hatayı detaylı basar
        res.status(500).json({ error: err.message });
    }
});

// 8. İLERLEME DURUMUNU GETİR (EKSİKTİ!)
app.get('/api/ilerleme/:id', async (req, res) => {
    try {
        const ilerlemeler = await KullaniciIlerleme.findAll({
            where: { kullanici_id: req.params.id, tamamlandi: true }
        });
        res.json(ilerlemeler);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9. OYUN PUANI EKLE (EKSİKTİ!)
app.post('/api/puan-ekle', async (req, res) => {
    try {
        const { kullaniciId, puan } = req.body;
        const user = await Kullanici.findByPk(kullaniciId);
        if (user) {
            user.puan = (user.puan || 0) + parseInt(puan);
            await user.save();
            res.json({ success: true, yeniPuan: user.puan });
        } else {
            res.status(404).json({ error: "Kullanıcı bulunamadı" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 10. CHAT BOT (EKSİKTİ!)
app.post('/api/chat-bot', async (req, res) => {
    try {
        const { mesaj } = req.body;
        const chatPrompt = `Sen bir tarih öğretmenisin. Öğrencinin sorusuna kısa, öz ve eğlenceli bir şekilde cevap ver. Soru: ${mesaj}`;
        const result = await model.generateContent(chatPrompt);
        const response = await result.response;
        res.json({ cevap: response.text() });
    } catch (err) {
        res.status(500).json({ error: "Chat hatası" });
    }
});

// 11. ADMIN: SORU EKLE
app.post('/admin/soru-ekle', async (req, res) => {
    try {
        await KonuQuiz.create({
            konu_tipi: req.body.konu_tipi,
            konu_id: req.body.konu_id,
            soru_metni: req.body.soru_metni,
            sik_a: req.body.sik_a,
            sik_b: req.body.sik_b,
            sik_c: req.body.sik_c,
            sik_d: req.body.sik_d,
            dogru_cevap: req.body.dogru_cevap
        });
        res.redirect('/admin');
    } catch (err) {
        res.send("Soru ekleme hatası: " + err.message);
    }
});

// 12. LİDERLİK TABLOSU VERİSİ
app.get('/api/liderlik-verisi', async (req, res) => {
    try {
        const enIyiler = await Kullanici.findAll({
            attributes: ['kadi', 'ad', 'soyad', 'puan'],
            order: [['puan', 'DESC']],
            limit: 50
        });
        res.json(enIyiler);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 1. GÜNLÜK GÖREV DURUMU VE SORUSU
app.post('/api/gunluk-gorev-kontrol', async (req, res) => {
    const { kullaniciId } = req.body;
    const bugun = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatı

    try {
        // 1. Kullanıcı bugün çözmüş mü?
        const kayit = await GunlukGorevLog.findOne({
            where: { kullanici_id: kullaniciId, tarih: bugun }
        });

        if (kayit) {
            return res.json({ oynandi: true, mesaj: "Bugünkü görevi tamamladın. Yarın tekrar gel!" });
        }

        // 2. Çözmemişse, günün sorusunu seç (Günün tarihine göre matematiksel bir seçim yapalım ki herkese aynı soru gelsin)
        const tumSorular = await KonuQuiz.findAll();
        if (tumSorular.length === 0) return res.json({ hata: "Hiç soru yok." });

        // Basit bir algoritma: Ayın günü (1-31) modülüs toplam soru sayısı
        const gununGunu = new Date().getDate(); 
        const soruIndex = gununGunu % tumSorular.length; 
        const gununSorusu = tumSorular[soruIndex];

        res.json({ 
            oynandi: false, 
            soru: gununSorusu 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GÜNLÜK GÖREVİ KAYDET (PUAN VER)
app.post('/api/gunluk-gorev-tamamla', async (req, res) => {
    const { kullaniciId, puan } = req.body;
    const bugun = new Date().toISOString().split('T')[0];

    try {
        // Log tablosuna kaydet (Bir daha çözemesin diye)
        await GunlukGorevLog.create({
            kullanici_id: kullaniciId,
            tarih: bugun
        });

        // Kullanıcıya puan ekle
        const user = await Kullanici.findByPk(kullaniciId);
        if (user) {
            user.puan = (user.puan || 0) + parseInt(puan);
            await user.save();
        }

        res.json({ success: true, yeniPuan: user.puan });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SUNUCUYU BAŞLAT ---
// server.js EN ALT KISIM:

// { alter: true } ayarı, tablolarda değişiklik varsa veritabanını günceller.
sequelize.sync({ alter: true }) 
    .then(() => {
        console.log("✅ Veritabanı tabloları güncellendi ve bağlandı.");
        app.listen(PORT, () => {
            console.log(`🚀 Sunucu Çalışıyor: http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Veritabanı Bağlantı Hatası:", err);
    });