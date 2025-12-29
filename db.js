const { Sequelize } = require('sequelize');

// Veritabanı bağlantı ayarları
// 'tarih_agaci': Veritabanı adı
// 'root': Kullanıcı adı
// '12345': Şifren (Kendi şifrenle değiştirmeyi unutma!)
const sequelize = new Sequelize('tarih_agaci', 'root', '12345', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Konsol kirliliğini önlemek için SQL çıktılarını kapatır
    define: {
        timestamps: false, // createdAt ve updatedAt sütunlarını otomatik istemiyoruz (SQL dosyanla uyumlu olsun diye)
        freezeTableName: true // Tablo isimlerini çoğul yapmasını engeller (liderler -> liderlers olmasın diye)
    }
});

async function baglantiyiTestEt() {
    try {
        await sequelize.authenticate();
        console.log('✅ Sequelize ile veritabanı bağlantısı başarılı!');
    } catch (error) {
        console.error('❌ Bağlantı hatası:', error);
    }
}

baglantiyiTestEt();

module.exports = sequelize;
