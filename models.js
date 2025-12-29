const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db');


const Lider = sequelize.define('Lider', {
    ad: { type: DataTypes.STRING },
    donem: { type: DataTypes.STRING },
    bilgi: { type: DataTypes.TEXT },
    detay: { type: DataTypes.TEXT('long') },
    sira_no: { type: DataTypes.INTEGER }
}, { tableName: 'liderler', timestamps: false });

const Devlet = sequelize.define('Devlet', {
    ad: { type: DataTypes.STRING },
    baskent: { type: DataTypes.STRING },
    kurulus: { type: DataTypes.STRING },
    bilgi: { type: DataTypes.TEXT },
    detay: { type: DataTypes.TEXT('long') },
    sira_no: { type: DataTypes.INTEGER }
}, { tableName: 'devletler', timestamps: false });

const Kategori = sequelize.define('Kategori', {
    kod: { type: DataTypes.STRING, primaryKey: true }, 
    baslik: { type: DataTypes.STRING },
    alt_baslik: { type: DataTypes.STRING },
    ikon: { type: DataTypes.STRING }
}, { tableName: 'kategoriler', timestamps: false });

const KategoriOgesi = sequelize.define('KategoriOgesi', {
    kategori_kod: { type: DataTypes.STRING },
    baslik: { type: DataTypes.STRING },
    aciklama: { type: DataTypes.TEXT },
    detay: { type: DataTypes.TEXT('long') },
    sira_no: { type: DataTypes.INTEGER }
}, { tableName: 'kategori_ogeleri', timestamps: false });

const Kullanici = sequelize.define('Kullanici', {
    ad: { type: DataTypes.STRING },
    soyad: { type: DataTypes.STRING },
    kadi: { type: DataTypes.STRING, unique: true },
    eposta: { type: DataTypes.STRING },
    sifre: { type: DataTypes.STRING },
    puan: { type: DataTypes.INTEGER, defaultValue: 0 },
    rol: { type: DataTypes.STRING, defaultValue: 'uye' },
    kayit_tarihi: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { tableName: 'kullanicilar', timestamps: false });

const KullaniciIlerleme = sequelize.define('KullaniciIlerleme', {
   
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    // ---------------------------
    kullanici_id: { type: DataTypes.INTEGER },
    konu_tipi: { type: DataTypes.STRING },
    konu_id: { type: DataTypes.INTEGER },
    tamamlandi: { type: DataTypes.BOOLEAN, defaultValue: true },
    tarih: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { tableName: 'kullanici_ilerleme', timestamps: false });

const KonuQuiz = sequelize.define('KonuQuiz', {
    konu_tipi: { type: DataTypes.STRING },
    konu_id: { type: DataTypes.INTEGER },
    soru_metni: { type: DataTypes.TEXT },
    sik_a: { type: DataTypes.STRING },
    sik_b: { type: DataTypes.STRING },
    sik_c: { type: DataTypes.STRING },
    sik_d: { type: DataTypes.STRING },
    dogru_cevap: { type: DataTypes.CHAR(1) }
}, { tableName: 'konu_quizleri', timestamps: false });


Kategori.hasMany(KategoriOgesi, { foreignKey: 'kategori_kod', sourceKey: 'kod' });
KategoriOgesi.belongsTo(Kategori, { foreignKey: 'kategori_kod', targetKey: 'kod' });


const GunlukGorevLog = sequelize.define('GunlukGorevLog', {
    kullanici_id: { type: DataTypes.INTEGER },
    tarih: { type: DataTypes.DATEONLY } 
}, { tableName: 'gunluk_gorev_loglari', timestamps: false });

module.exports = { Lider, Devlet, Kategori, KategoriOgesi, Kullanici, KullaniciIlerleme, KonuQuiz, GunlukGorevLog };


