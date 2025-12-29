const { Sequelize } = require('sequelize');
const { KonuQuiz } = require('./models'); 

async function sorulariYukle() {
    try {
        console.log("⏳ Sorular yükleniyor...");

        
        await KonuQuiz.destroy({ where: {}, truncate: true });

        const ornekSorular = [
           
            {
                konu_tipi: 'lider',
                konu_id: 1, 
                soru_metni: "Mete Han, hangi devletin en parlak dönemini yaşatan hükümdarıdır?",
                sik_a: "Göktürkler",
                sik_b: "Büyük Hun Devleti",
                sik_c: "Uygurlar",
                sik_d: "Osmanlı",
                dogru_cevap: "b"
            },
            {
                konu_tipi: 'lider',
                konu_id: 1,
                soru_metni: "Mete Han'ın dünya ordularına miras bıraktığı sistem nedir?",
                sik_a: "Onlu Sistem",
                sik_b: "Hilal Taktiği",
                sik_c: "Devşirme Sistemi",
                sik_d: "İkili Teşkilat",
                dogru_cevap: "a"
            },
            
            {
                konu_tipi: 'lider',
                konu_id: 2, 
                soru_metni: "Fatih Sultan Mehmet, İstanbul'u fethettiğinde kaç yaşındaydı?",
                sik_a: "19",
                sik_b: "21",
                sik_c: "25",
                sik_d: "18",
                dogru_cevap: "b"
            },

           
            {
                konu_tipi: 'devlet',
                konu_id: 1, 
                soru_metni: "Tarihte bilinen ilk Türk devleti hangisidir?",
                sik_a: "Avarlar",
                sik_b: "Büyük Hun Devleti (Asya Hun)",
                sik_c: "Göktürkler",
                sik_d: "Karahanlılar",
                dogru_cevap: "b"
            },
            
      
             {
                konu_tipi: 'devlet',
                konu_id: 2, 
                soru_metni: "Türk adıyla kurulan ilk devlet hangisidir?",
                sik_a: "Osmanlı",
                sik_b: "Selçuklu",
                sik_c: "Göktürk Devleti",
                sik_d: "Uygur Devleti",
                dogru_cevap: "c"
            }
        ];

        await KonuQuiz.bulkCreate(ornekSorular);
        console.log("✅ Başarılı! Örnek sorular veritabanına eklendi.");
        
    } catch (error) {
        console.error("❌ Hata oluştu:", error);
    } finally {
        process.exit();
    }
}

sorulariYukle();