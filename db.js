const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('tarih_agaci', 'root', '12345', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, 
    define: {
        timestamps: false, 
        freezeTableName: true 
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
