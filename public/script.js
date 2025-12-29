

async function yapayZekayaAnlat(isim) {
  
    alert(isim + " için yapay zeka hazırlanıyor...");

    const response = await fetch('/api/ai-anlat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baslik: isim })
    });

    const veri = await response.json();
    
    console.log(veri.anlatim); 
    
}


const oyunQuizSorulari = [
    { soru: "İstanbul kaç yılında fethedildi?", siklar: ["1453", "1071", "1923", "1299"], cevap: "1453" },
    { soru: "İlk Türk devletlerinde meclise ne denir?", siklar: ["Toy (Kurultay)", "Pankuş", "Senato", "Divan"], cevap: "Toy (Kurultay)" },
    { soru: "'Tanrının Kırbacı' kimdir?", siklar: ["Attila", "Mete Han", "Timur", "Cengiz Han"], cevap: "Attila" },
    { soru: "Hangi padişah Halifeliği Osmanlı'ya getirdi?", siklar: ["Yavuz Sultan Selim", "Fatih Sultan Mehmet", "Kanuni Sultan Süleyman", "II. Abdülhamid"], cevap: "Yavuz Sultan Selim" },
    { soru: "Cumhuriyet ne zaman ilan edildi?", siklar: ["29 Ekim 1923", "23 Nisan 1920", "19 Mayıs 1919", "30 Ağustos 1922"], cevap: "29 Ekim 1923" }
];

const eslesmeVerisi = [
    { id: 1, metin: "Fatih Sultan Mehmet", tip: "lider" }, { id: 1, metin: "İstanbul'un Fethi", tip: "olay" },
    { id: 2, metin: "Mete Han", tip: "lider" }, { id: 2, metin: "Onlu Sistem", tip: "olay" },
    { id: 3, metin: "Mustafa Kemal Atatürk", tip: "lider" }, { id: 3, metin: "Cumhuriyetin İlanı", tip: "olay" },
    { id: 4, metin: "Sultan Alparslan", tip: "lider" }, { id: 4, metin: "Malazgirt Savaşı", tip: "olay" },
    { id: 5, metin: "Barbaros Hayrettin Paşa", tip: "lider" }, { id: 5, metin: "Preveze Zaferi", tip: "olay" },
    { id: 6, metin: "II. Kılıçarslan", tip: "lider" }, { id: 6, metin: "Miryokefalon Savaşı", tip: "olay" }
];

const rozetler = [
    { isim: "Tarih Çırağı", puan: 0, ikon: "🌱" },
    { isim: "Tarih Kalfası", puan: 50, ikon: "🔨" },
    { isim: "Tarih Ustası", puan: 150, ikon: "⚔️" },
    { isim: "Bilge Kağan", puan: 300, ikon: "📜" },
    { isim: "Cihan Hakanı", puan: 500, ikon: "👑" },
    { isim: "Ebedi Kahraman", puan: 1000, ikon: "⭐" }
];

let aktifDersQuizSorulari = [];
let dersQuizIndeksi = 0;
let dersQuizDogruSayisi = 0;
let tamamlananlar = []; 


let oyunQuizIndeksi = 0;
let oyunQuizPuani = 0;
let eslesmePuani = 0;
let cevrilenKartlar = [];
let eslesenCiftler = 0;

window.onload = function() {
    const kullanici = mevcutKullaniciyiGetir();
    const kayitliTema = localStorage.getItem('tema') || 'acik';
    document.documentElement.setAttribute('data-theme', kayitliTema);
    temayiUygula(kayitliTema);

    if (kullanici) {
        uygulamayiGoster(kullanici);
    } else {
        document.getElementById('kimlik-kapsayici').classList.remove('d-none');
    }
    
    kategorileriListele();
    gunlukLideriYukle(); 
};

function temayiDegistir() {
    const html = document.documentElement;
    const mevcut = html.getAttribute('data-theme');
    const yeni = mevcut === 'acik' ? 'koyu' : 'acik';
    html.setAttribute('data-theme', yeni);
    localStorage.setItem('tema', yeni);
    temayiUygula(yeni);
}

function temayiUygula(tema) {
    const btn = document.getElementById('tema-degistir-btn');
    if(btn) {
        btn.innerHTML = tema === 'koyu' ? '<i class="fa-solid fa-sun fs-5"></i>' : '<i class="fa-solid fa-moon fs-5"></i>';
    }
}

async function uygulamayiGoster(kullanici) {
    document.getElementById('kimlik-kapsayici').classList.add('d-none');
    document.getElementById('ana-uygulama').classList.remove('d-none');
    document.getElementById('nav-kullanici-adi').innerText = kullanici.kadi;
    
    try {
        const res = await fetch(`/api/ilerleme/${kullanici.id}`);
        const data = await res.json();
        tamamlananlar = data; 
    } catch (e) { console.error("İlerleme çekilemedi"); }
    
    icerikleriOlustur('lider', liderlerVerisi, 'liderler-izgarasi');
    icerikleriOlustur('devlet', devletlerVerisi, 'devletler-izgarasi');
    profiliGoster(kullanici);
}


function icerikleriOlustur(tip, veriListesi, kapsayiciId) {
    const container = document.getElementById(kapsayiciId);
    if(!container) return;
    
    container.innerHTML = veriListesi.map((oge, index) => {
        let kilitli = false;
        if (index > 0) {
            const oncekiId = veriListesi[index - 1].id;
            const oncekiTamamlandi = tamamlananlar.some(t => t.konu_tipi === tip && t.konu_id == oncekiId);
            if (!oncekiTamamlandi) kilitli = true;
        }

        const tamamlandi = tamamlananlar.some(t => t.konu_tipi === tip && t.konu_id == oge.id);
        let ikon = tip === 'lider' ? 'fa-crown' : (tip === 'devlet' ? 'fa-landmark' : 'fa-scroll');

        return `
        <div class="col-md-6 col-lg-4">
            <div class="ozel-tasarim-kart ${kilitli ? 'kilitli-kart' : ''} shadow-sm" 
                 style="border-left: 5px solid ${tip === 'lider' ? '#c0392b' : '#27ae60'};"
                 onclick="${kilitli ? "alert('🔒 Önceki konuyu tamamlamalısın!')" : `yapayZekaDersiAc('${tip}', ${index})`}">
                ${kilitli ? '<div class="kilit-ikonu"><i class="fa-solid fa-lock fa-3x"></i></div>' : ''}
                ${tamamlandi ? '<div class="tamamlandi-rozeti"><i class="fa-solid fa-check-circle text-success fs-3"></i></div>' : ''}
                <i class="fa-solid ${ikon} kart-ikon"></i>
                <h5 class="kart-baslik">${oge.ad || oge.baslik}</h5>
                <p class="kart-metin">${(oge.bilgi || oge.aciklama || '').substring(0, 80)}...</p>
                <div class="mt-auto">
                    <span class="badge ${tamamlandi ? 'bg-success' : (kilitli ? 'bg-secondary' : 'bg-primary')}">
                        ${tamamlandi ? 'Tamamlandı' : (kilitli ? 'Kilitli' : 'Başla')}
                    </span>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function oyunuBaslat(tip) {
    document.getElementById('oyun-menusu').classList.add('d-none');
    if(tip === 'quiz') {
        document.getElementById('bilgi-yarismasi-alani').classList.remove('d-none');
        oyunQuizIndeksi = 0; oyunQuizPuani = 0; oyunQuizSorusunuYukle();
    } else if (tip === 'eslestirme') {
        document.getElementById('eslestirme-alani').classList.remove('d-none');
        eslesmePuani = 0; eslestirmeOyununuBaslat();
    } else if (tip === 'siralama') {
        document.getElementById('siralama-alani').classList.remove('d-none');
        mevcutSiralamaSeviyesi = 0; siralamaOyununuYukle();
    }
}

function oyunMenusuneDon() {
    document.getElementById('bilgi-yarismasi-alani').classList.add('d-none');
    document.getElementById('eslestirme-alani').classList.add('d-none');
    document.getElementById('siralama-alani').classList.add('d-none');
    document.getElementById('oyun-menusu').classList.remove('d-none');
}

function oyunQuizSorusunuYukle() {
    if(oyunQuizIndeksi >= oyunQuizSorulari.length) {
        document.getElementById('soru-metni').innerText = "🎉 Test Tamamlandı!";
        document.getElementById('secenekler-alani').innerHTML = 
            `<h4 class="text-success mb-3">Toplam Puan: ${oyunQuizPuani}</h4>
             <button class="btn btn-primary" onclick="oyunMenusuneDon()">Menüye Dön</button>`;
        return;
    }
    const s = oyunQuizSorulari[oyunQuizIndeksi];
    document.getElementById('soru-metni').innerText = s.soru;
    document.getElementById('soru-suan').innerText = oyunQuizIndeksi + 1;
    document.getElementById('soru-toplam').innerText = oyunQuizSorulari.length;
    document.getElementById('quiz-puani').innerText = oyunQuizPuani;
    document.getElementById('quiz-sonucu').innerHTML = "";

    const alan = document.getElementById('secenekler-alani');
    alan.innerHTML = "";
    
    [...s.siklar].sort(() => Math.random() - 0.5).forEach(secenek => {
        const btn = document.createElement('button');
        btn.className = "btn btn-outline-dark p-3 fs-5 fw-bold text-start w-100 mb-2";
        btn.innerText = secenek;
        btn.onclick = () => oyunCevabiKontrolEt(secenek, s.cevap, btn);
        alan.appendChild(btn);
    });
}

function oyunCevabiKontrolEt(secilen, dogru, btn) {
    const butonlar = document.querySelectorAll('#secenekler-alani button');
    butonlar.forEach(b => b.disabled = true);
    
    if(secilen === dogru) {
        btn.classList.remove('btn-outline-dark'); btn.classList.add('btn-success');
        oyunQuizPuani += 10;
        document.getElementById('quiz-puani').innerText = oyunQuizPuani;
        document.getElementById('quiz-sonucu').innerHTML = `<span class="text-success">✅ Doğru! (+10 Puan)</span>`;
        puanVer(10);
    } else {
        btn.classList.remove('btn-outline-dark'); btn.classList.add('btn-danger');
        butonlar.forEach(b => { if(b.innerText === dogru) { b.classList.remove('btn-outline-dark'); b.classList.add('btn-success'); } });
        document.getElementById('quiz-sonucu').innerHTML = `<span class="text-danger">❌ Yanlış!</span>`;
    }
    setTimeout(() => { oyunQuizIndeksi++; oyunQuizSorusunuYukle(); }, 2000);
}

function eslestirmeOyununuBaslat() {
    const izgara = document.getElementById('eslestirme-izgarasi');
    izgara.innerHTML = "";
    document.getElementById('eslestirme-puani').innerText = eslesmePuani;
    document.getElementById('eslestirme-sonucu').innerHTML = "";
    eslesenCiftler = 0; cevrilenKartlar = [];

    let kartlar = [...eslesmeVerisi].sort(() => Math.random() - 0.5);

    kartlar.forEach((oge) => {
        const div = document.createElement('div');
        div.className = "col-md-3 col-6";
        div.innerHTML = `<div class="eslesme-karti shadow-sm" data-id="${oge.id}" data-tip="${oge.tip}" onclick="kartiCevir(this)">${oge.metin}</div>`;
        izgara.appendChild(div);
    });
}

function kartiCevir(kart) {
    if(kart.classList.contains('eslesti') || kart.classList.contains('secildi') || cevrilenKartlar.length >= 2) return;
    kart.classList.add('secildi');
    cevrilenKartlar.push(kart);
    if(cevrilenKartlar.length === 2) eslesmeyiKontrolEt();
}

function eslesmeyiKontrolEt() {
    const [k1, k2] = cevrilenKartlar;
    const id1 = k1.getAttribute('data-id');
    const id2 = k2.getAttribute('data-id');
    const sonucAlani = document.getElementById('eslestirme-sonucu');

    if(id1 === id2) {
        k1.classList.remove('secildi'); k1.classList.add('eslesti');
        k2.classList.remove('secildi'); k2.classList.add('eslesti');
        eslesmePuani += 20;
        document.getElementById('eslestirme-puani').innerText = eslesmePuani;
        sonucAlani.innerHTML = `<span class="text-success">✅ Eşleşme Başarılı!</span>`;
        puanVer(20);
        eslesenCiftler++;
        if(eslesenCiftler === eslesmeVerisi.length) {
            sonucAlani.innerHTML += "<br>🎉 OYUN BİTTİ!";
            setTimeout(() => oyunMenusuneDon(), 3000);
        }
    } else {
        k1.classList.add('yanlis'); k2.classList.add('yanlis');
        sonucAlani.innerHTML = `<span class="text-danger">❌ Eşleşmedi!</span>`;
        setTimeout(() => {
            k1.classList.remove('secildi', 'yanlis'); k2.classList.remove('secildi', 'yanlis');
        }, 1000);
    }
    cevrilenKartlar = [];
}


function gunlukLideriYukle() {
    if (typeof liderlerVerisi === 'undefined' || liderlerVerisi.length === 0) return;

    const bugun = new Date().toLocaleDateString('tr-TR'); 
    let kayitliVeri = JSON.parse(localStorage.getItem('gununLideri'));
    
    let secilenLider;
    let secilenIndex;

    if (!kayitliVeri || kayitliVeri.tarih !== bugun) {
        secilenIndex = Math.floor(Math.random() * liderlerVerisi.length);
        secilenLider = liderlerVerisi[secilenIndex];
        
        localStorage.setItem('gununLideri', JSON.stringify({
            tarih: bugun,
            index: secilenIndex
        }));
    } else {
        secilenIndex = kayitliVeri.index;
        if (secilenIndex >= liderlerVerisi.length) secilenIndex = 0;
        secilenLider = liderlerVerisi[secilenIndex];
    }

    const kart = document.getElementById('gunun-lideri-karti');
    if (kart) {
        kart.innerHTML = `
            <div class="d-flex flex-column justify-content-between h-100" style="min-height: 180px;">
                <div class="d-flex align-items-center mb-4">
                    <div class="flex-shrink-0 me-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center shadow-lg position-relative" 
                             style="width: 85px; height: 85px; background-color: var(--arkaplan-rengi); border: 3px solid var(--ikincil-renk);">
                            <i class="fa-solid fa-crown fa-2x" style="color: var(--ana-renk);"></i>
                            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">Yeni</span>
                        </div>
                    </div>
                    <div style="flex-grow: 1;">
                        <small class="text-uppercase fw-bold mb-1 d-block" style="color: var(--ikincil-renk); letter-spacing: 1px; font-size: 0.7rem;">GÜNÜN LİDERİ</small>
                        <h3 class="fw-bold mb-0 cinzel-font" style="color: var(--yazi-rengi); line-height: 1.2;">${secilenLider.ad}</h3>
                        <small class="text-muted fw-bold" style="font-size: 0.85rem;">${secilenLider.donem}</small>
                    </div>
                </div>
                <div class="d-flex align-items-center justify-content-between pt-3 border-top" style="border-color: rgba(0,0,0,0.1) !important;">
                    <div class="d-flex align-items-center px-3 py-2 rounded" style="background-color: var(--arkaplan-rengi);">
                        <i class="fa-regular fa-clock me-2 text-danger"></i>
                        <span id="geri-sayim" class="font-monospace fw-bold fs-5" style="color: white;">--:--</span>
                    </div>
                    <button class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm" 
                            style="background-color: var(--ana-renk); border-color: var(--ana-renk);"
                            onclick="yapayZekaDersiAc('lider', ${secilenIndex})">
                        İncele <i class="fa-solid fa-arrow-right ms-2"></i>
                    </button>
                </div>
            </div>
        `;
        geriSayimiBaslat();
    }
}

function geriSayimiBaslat() {
    const sayacElem = document.getElementById('geri-sayim');
    if (!sayacElem) return;
    if (window.sayacInterval) clearInterval(window.sayacInterval);

    window.sayacInterval = setInterval(() => {
        const simdi = new Date();
        const yarin = new Date(simdi);
        yarin.setHours(24, 0, 0, 0); 
        const fark = yarin - simdi;
        if (fark <= 0) {
            clearInterval(window.sayacInterval);
            gunlukLideriYukle(); 
            return;
        }
        const saat = Math.floor((fark / (1000 * 60 * 60)) % 24);
        const dakika = Math.floor((fark / (1000 * 60)) % 60);
        const saniye = Math.floor((fark / 1000) % 60);
        sayacElem.innerText = `${saat.toString().padStart(2, '0')}:${dakika.toString().padStart(2, '0')}:${saniye.toString().padStart(2, '0')}`;
    }, 1000);
}
async function dersQuiziniBaslat(tip, id) {
    const btn = document.getElementById('dersAksiyonBtn');
    btn.innerText = "Yükleniyor...";
    btn.disabled = true;

    try {
        const res = await fetch(`/api/quiz/${tip}/${id}`);
        const sorular = await res.json();
        
        if(sorular.length === 0) {
            alert("Bu konu için henüz test sorusu eklenmemiş. Otomatik geçiliyor (Puan Yok).");
            dersiTamamla(0); 
            return;
        }

        aktifDersQuizSorulari = sorular;
        dersQuizIndeksi = 0;
        dersQuizDogruSayisi = 0;
        
        document.getElementById('dersDurum').innerText = "Quiz Modu";
        dersSorusunuGoster();
        
    } catch (e) { console.error(e); alert("Quiz yüklenemedi!"); btn.innerText = "Hata"; }
}

function dersSorusunuGoster() {
    const btn = document.getElementById('dersAksiyonBtn');
    const govde = document.getElementById('dersGovdesi');
    const soru = aktifDersQuizSorulari[dersQuizIndeksi];
    btn.classList.add('d-none'); 

    govde.innerHTML = `
        <div class="text-center animasyon-goster">
            <div class="progress mb-4" style="height: 10px;">
                <div class="progress-bar bg-warning" role="progressbar" style="width: ${((dersQuizIndeksi)/aktifDersQuizSorulari.length)*100}%"></div>
            </div>
            <span class="badge bg-secondary mb-2">Soru ${dersQuizIndeksi + 1} / ${aktifDersQuizSorulari.length}</span>
            <h4 class="mb-4 fw-bold">${soru.soru_metni}</h4>
            <div class="d-grid gap-3 col-lg-8 mx-auto">
                <button class="btn btn-outline-dark p-3 text-start sik-btn" onclick="dersCevapVer('a', '${soru.dogru_cevap}')">A) ${soru.sik_a}</button>
                <button class="btn btn-outline-dark p-3 text-start sik-btn" onclick="dersCevapVer('b', '${soru.dogru_cevap}')">B) ${soru.sik_b}</button>
                <button class="btn btn-outline-dark p-3 text-start sik-btn" onclick="dersCevapVer('c', '${soru.dogru_cevap}')">C) ${soru.sik_c}</button>
                <button class="btn btn-outline-dark p-3 text-start sik-btn" onclick="dersCevapVer('d', '${soru.dogru_cevap}')">D) ${soru.sik_d}</button>
            </div>
        </div>
    `;
}

function dersCevapVer(secilen, dogru) {
    const butonlar = document.querySelectorAll('.sik-btn');
    butonlar.forEach(b => b.disabled = true);
    if(secilen === dogru) dersQuizDogruSayisi++;
    
    butonlar.forEach(b => {
        const sikMetni = b.innerText.toLowerCase();
        if(sikMetni.startsWith(dogru + ')')) { b.classList.remove('btn-outline-dark'); b.classList.add('btn-success'); } 
        else if(sikMetni.startsWith(secilen + ')') && secilen !== dogru) { b.classList.remove('btn-outline-dark'); b.classList.add('btn-danger'); }
    });

    setTimeout(() => {
        dersQuizIndeksi++;
        if(dersQuizIndeksi < aktifDersQuizSorulari.length) dersSorusunuGoster();
        else dersQuizSonucunuGoster();
    }, 1500);
}

function dersQuizSonucunuGoster() {
    const govde = document.getElementById('dersGovdesi');
    const basariOrani = (dersQuizDogruSayisi / aktifDersQuizSorulari.length) * 100;
    const gecti = basariOrani >= 50;
    
    const dahaOnceTamamlandi = tamamlananlar.some(t => t.konu_tipi === aktifKonu.tip && t.konu_id == aktifKonu.id);
    let kazanilanPuan = 0;
    let uyariMesaji = '';

    if (gecti) {
        if (dahaOnceTamamlandi) {
            uyariMesaji = '<div class="alert alert-info mt-3"><i class="fa-solid fa-info-circle"></i> Bu dersi daha önce tamamladığınız için tekrar puan verilmez.</div>';
        } else {
            kazanilanPuan = 50 + (dersQuizDogruSayisi * 10);
        }
    }

    govde.innerHTML = `
        <div class="text-center py-5 animasyon-goster">
            <i class="fa-solid ${gecti ? 'fa-trophy text-warning' : 'fa-face-frown text-danger'} fa-5x mb-4"></i>
            <h3 class="fw-bold">${gecti ? 'Tebrikler! Dersi Geçtin.' : 'Maalesef Başarısız Oldun.'}</h3>
            <p class="lead">Doğru Sayısı: ${dersQuizDogruSayisi} / ${aktifDersQuizSorulari.length}</p>
            ${!gecti ? '<div class="alert alert-danger mt-3">Kilidi açmak için en az %50 başarı sağlamalısın.</div>' : ''}
            ${gecti ? uyariMesaji : ''}
        </div>
    `;

    const btn = document.getElementById('dersAksiyonBtn');
    btn.classList.remove('d-none'); btn.disabled = false;
    
    if(gecti) {
        btn.innerText = "Tamamla ve İlerle";
        btn.className = "btn btn-success rounded-pill px-4 shadow";
        btn.onclick = () => dersiTamamla(kazanilanPuan);
    } else {
        btn.innerText = "Tekrar Dene";
        btn.className = "btn btn-secondary rounded-pill px-4";
        btn.onclick = () => yapayZekaDersiAc(aktifKonu.tip, aktifKonu.index);
    }
}

async function dersiTamamla(puan) {
    const kullanici = mevcutKullaniciyiGetir();
    
    if (!kullanici || !kullanici.id) {
        alert("Oturum süreniz dolmuş veya giriş yapılmamış. Lütfen tekrar giriş yapın.");
        return;
    }

    const btn = document.getElementById('dersAksiyonBtn');
    const eskiYazi = btn.innerText;
    btn.innerText = "Kaydediliyor...";
    btn.disabled = true;

    try {
        const res = await fetch('/api/tamamla', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                kullaniciId: kullanici.id, 
                tip: aktifKonu.tip, 
                id: aktifKonu.id, 
                puan: puan 
            })
        });
        
        if(res.ok) {
           
            const zatenVar = tamamlananlar.some(t => t.konu_tipi === aktifKonu.tip && t.konu_id == aktifKonu.id);
            if (!zatenVar) {
                tamamlananlar.push({ konu_tipi: aktifKonu.tip, konu_id: parseInt(aktifKonu.id) });
            }
            
          
            kullanici.puan = (kullanici.puan || 0) + puan;
            localStorage.setItem('mevcutKullanici', JSON.stringify(kullanici));
            
            uygulamayiGoster(kullanici); 

           
            if (aktifKonu.tip !== 'lider' && aktifKonu.tip !== 'devlet') {
                kategoriAc(aktifKonu.tip);
            }

            const govde = document.getElementById('dersGovdesi');
            document.getElementById('dersDurum').innerText = "Tamamlandı";
          
            govde.innerHTML = `
                <div class="text-center py-5 animasyon-goster">
                    <i class="fa-solid fa-check-circle text-success fa-5x mb-3"></i>
                    <h3 class="text-success fw-bold">Ders Tamamlandı!</h3>
                    <p class="lead">Puanınız hesabınıza eklendi.</p>
                </div>`;
            
            btn.innerText = "Sonraki Ders  ⏭️";
            btn.className = "btn btn-primary rounded-pill px-4 shadow"; 
            btn.disabled = false;
            
            
            btn.onclick = () => {
             
                const modalEl = document.getElementById('dersModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();

               
                setTimeout(() => {
                    const sonrakiIndex = aktifKonu.index + 1;
                    
                    
                    let listeUzunlugu = 0;
                    if(aktifKonu.tip === 'lider') listeUzunlugu = liderlerVerisi.length;
                    else if(aktifKonu.tip === 'devlet') listeUzunlugu = devletlerVerisi.length;
                    
                    
                    if (sonrakiIndex < listeUzunlugu) {
                        yapayZekaDersiAc(aktifKonu.tip, sonrakiIndex);
                    } else {
                        alert("Tebrikler! Bu bölümdeki tüm konuları bitirdin. 🏆");
                    }
                }, 500); 
            };
           

        } else {
            const hataVerisi = await res.json();
            alert("Kayıt hatası: " + (hataVerisi.error || "Bilinmeyen hata"));
            btn.innerText = eskiYazi; 
            btn.disabled = false;
        }

    } catch(e) { 
        console.error("Bağlantı hatası:", e);
        alert("Sunucuya bağlanılamadı! Lütfen internetinizi veya sunucuyu kontrol edin.");
        btn.innerText = eskiYazi;
        btn.disabled = false;
    }
}
function kategoriAc(id) {
    const veri = kategoriVerisi[id];
    if(!veri) return;

    document.getElementById('kat-detay-baslik').innerText = veri.baslik;
    document.getElementById('kat-detay-altbaslik').innerText = veri.altBaslik || '';
    
    const container = document.getElementById('kat-detay-icerik');
    container.innerHTML = "";
    
    const html = veri.ogeler.map((oge, index) => {
        let kilitli = false;
        if (index > 0) {
            const oncekiId = veri.ogeler[index-1].id;
            const oncekiTamamlandi = tamamlananlar.some(t => t.konu_tipi === id && t.konu_id == oncekiId);
            if(!oncekiTamamlandi) kilitli = true;
        }
        const tamamlandi = tamamlananlar.some(t => t.konu_tipi === id && t.konu_id == oge.id);

        return `
        <div class="col-md-6 mb-3">
            <div class="tarihi-oge-karti ${kilitli ? 'kilitli-kart' : ''} shadow-sm d-flex flex-column h-100"
                 onclick="${kilitli ? "alert('🔒 Önceki konuyu tamamlamalısın!')" : `yapayZekaDersiAc('${id}', ${index})`}">
                ${kilitli ? '<div class="kilit-ikonu"><i class="fa-solid fa-lock fa-3x"></i></div>' : ''}
                ${tamamlandi ? '<div class="tamamlandi-rozeti"><i class="fa-solid fa-check-circle text-success fs-3"></i></div>' : ''}
                <div class="d-flex align-items-center mb-3">
                    <div class="icon-square bg-light text-dark flex-shrink-0 me-3">
                        <i class="${veri.ikon || 'fa-solid fa-scroll'}"></i>
                    </div>
                    <div>
                        <h5 class="oge-baslik mb-0">${oge.baslik}</h5>
                    </div>
                </div>
                <p class="text-muted small mb-3 flex-grow-1">${(oge.aciklama || '').substring(0,80)}...</p>
                <button class="btn btn-sm ${kilitli ? 'btn-light text-muted' : (tamamlandi ? 'btn-success text-white' : 'btn-outline-primary')} w-100 rounded-pill mt-auto fw-bold border-0">
                     ${tamamlandi ? '<i class="fa-solid fa-rotate-left me-1"></i> Tekrar Et' : (kilitli ? '<i class="fa-solid fa-lock me-1"></i> Kilitli' : 'Başla')}
                </button>
            </div>
        </div>
        `;
    }).join('');
    
    container.innerHTML = html;
    bolumGoster('kategori-detay');
    window.scrollTo(0,0);
}

function kategorileriListele() {
    const izgara = document.getElementById('kategoriler-izgarasi');
    if(!izgara) return;
    const kaynak = (typeof rawKategoriler !== 'undefined' && rawKategoriler.length > 0) ? rawKategoriler : [ { kod: 'savaslar', baslik: '⚔️ Savaşlar' } ]; 
    izgara.innerHTML = kaynak.map(k => `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 kategori-karti p-4 shadow-sm border-0" onclick="kategoriAc('${k.kod}')">
                <div class="mb-3 display-6 text-primary"><i class="${k.ikon || 'fa-solid fa-book'}"></i></div>
                <h4 class="cinzel-font kat-baslik">${k.baslik}</h4>
                <p class="kat-aciklama m-0 text-muted">${k.alt_baslik || ''}</p>
            </div>
        </div>
    `).join('');
}

async function girisYap() {
    const kadi = document.getElementById('giris-kadi').value;
    const sifre = document.getElementById('giris-sifre').value;
    try {
        const response = await fetch('/api/giris', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kadi, sifre }) });
        const sonuc = await response.json();
        if (sonuc.success) { localStorage.setItem('mevcutKullanici', JSON.stringify(sonuc.user)); uygulamayiGoster(sonuc.user); } else { alert(sonuc.message); }
    } catch (error) { console.error(error); }
}

async function kayitOl() {
    const ad = document.getElementById('kayit-ad').value;
    const soyad = document.getElementById('kayit-soyad').value;
    const kadi = document.getElementById('kayit-kadi').value;
    const eposta = document.getElementById('kayit-eposta').value;
    const sifre = document.getElementById('kayit-sifre').value;

    try {
        const response = await fetch('/api/kayit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ad, soyad, kadi, eposta, sifre }) });
        const sonuc = await response.json();
        if (response.ok) { alert("Kayıt başarılı! Giriş yapabilirsiniz."); kimlikGoster('giris'); } else { alert("Hata: " + sonuc.error); }
    } catch (error) { console.error(error); }
}

function mevcutKullaniciyiGetir() { return JSON.parse(localStorage.getItem('mevcutKullanici')); }
function cikisYap() { localStorage.removeItem('mevcutKullanici'); document.getElementById('ana-uygulama').classList.add('d-none'); document.getElementById('kimlik-kapsayici').classList.remove('d-none'); kimlikGoster('giris'); document.getElementById('giris-kadi').value = ""; document.getElementById('giris-sifre').value = ""; }
window.cikisYap = cikisYap;

function kimlikGoster(tip) {
    const giris = document.getElementById('giris-karti'); 
    const kayit = document.getElementById('kayit-karti');
    if(tip === 'kayit') { giris.classList.add('d-none'); kayit.classList.remove('d-none'); }
    else { kayit.classList.add('d-none'); giris.classList.remove('d-none'); }
}

function bolumGoster(id) {
    document.querySelectorAll('.icerik-bolumu').forEach(s => { s.classList.add('d-none'); s.classList.remove('active'); });
    const hedef = document.getElementById(id);
    if(hedef) { hedef.classList.remove('d-none'); setTimeout(() => hedef.classList.add('active'), 50); }
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    if(id === 'liderlik-tablosu') liderlikTablosunuYenile();
    if(id === 'oyunlar') { const oyunLink = document.querySelector('a[onclick="bolumGoster(\'oyunlar\')"]'); if(oyunLink) oyunLink.classList.add('active'); }
    else if(id !== 'kategori-detay') { const link = document.querySelector(`a[onclick="bolumGoster('${id}')"]`); if(link) link.classList.add('active'); }
}

function profiliGoster(kullanici) {
    document.getElementById('profil-kadi').innerText = kullanici.kadi;
    document.getElementById('profil-puan').innerText = kullanici.puan || 0;
    let rutbe = "Acemi";
    for(let r of rozetler) { if((kullanici.puan || 0) >= r.puan) rutbe = r.isim; }
    document.getElementById('profil-rutbe').innerText = rutbe;

    const rozetAlani = document.getElementById('rozet-tablosu');
    if(rozetAlani) {
        const puan = kullanici.puan || 0;
        rozetAlani.innerHTML = rozetler.map(r => {
            const kazanildi = puan >= r.puan;
            return `<tr class="${kazanildi ? '' : 'text-muted opacity-50'}"><td class="ps-4 fs-4">${r.ikon}</td><td class="fw-bold">${r.isim}</td><td>${r.puan}</td><td class="text-center">${kazanildi ? '<span class="badge bg-success">Kazanıldı</span>' : '<span class="badge bg-secondary">Kilitli</span>'}</td></tr>`;
        }).join('');
    }
}
function chatAcKapat() { const pencere = document.getElementById('chatPenceresi'); pencere.classList.toggle('aktif'); if(pencere.classList.contains('aktif')) setTimeout(() => document.getElementById('chatInput').focus(), 300); }
function enterKontrol(event) { if (event.key === "Enter") mesajGonder(); }
async function mesajGonder() {
    const input = document.getElementById('chatInput');
    const mesajAlani = document.getElementById('chatMesajlari');
    const mesaj = input.value.trim();
    if (!mesaj) return;

    mesajAlani.innerHTML += `<div class="mesaj kullanici">${mesaj}</div>`;
    input.value = ""; mesajAlani.scrollTop = mesajAlani.scrollHeight;
    const loadingId = "loading-" + Date.now();
    mesajAlani.innerHTML += `<div class="mesaj bot" id="${loadingId}">Tarih kitaplarına bakıyorum... <i class="fa-solid fa-spinner fa-spin"></i></div>`;
    mesajAlani.scrollTop = mesajAlani.scrollHeight;

    try {
        const response = await fetch('/api/chat-bot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mesaj: mesaj }) });
        const data = await response.json();
        document.getElementById(loadingId).remove();
        mesajAlani.innerHTML += `<div class="mesaj bot">${data.cevap || "Bir hata oluştu reis."}</div>`;
    } catch (error) {
        document.getElementById(loadingId).remove();
        mesajAlani.innerHTML += `<div class="mesaj bot text-danger">Bağlantı hatası oluştu!</div>`;
    }
    mesajAlani.scrollTop = mesajAlani.scrollHeight;
}
async function puanVer(miktar) {
    const kullanici = mevcutKullaniciyiGetir();
    if (!kullanici) return;
    try {
        await fetch('/api/puan-ekle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kullaniciId: kullanici.id, puan: miktar }) });
        kullanici.puan = (kullanici.puan || 0) + miktar;
        localStorage.setItem('mevcutKullanici', JSON.stringify(kullanici));
        const profilPuan = document.getElementById('profil-puan');
        if(profilPuan) profilPuan.innerText = kullanici.puan;
    } catch (err) { console.error("Puan kaydedilemedi:", err); }
}

async function liderlikTablosunuYenile() {
    const tabloGovdesi = document.querySelector('#liderlik-tablosu tbody');
    if (!tabloGovdesi) return;
    try {
        const response = await fetch('/api/liderlik-verisi');
        const veriler = await response.json();
        tabloGovdesi.innerHTML = "";
        if (veriler.length === 0) { tabloGovdesi.innerHTML = '<tr><td colspan="4" class="text-center py-5 text-muted">Henüz kimse puan kazanmamış.</td></tr>'; return; }
        
        let html = "";
        veriler.forEach((uye, index) => {
            let siraIcon = "";
            let satirClass = "";
            if(index === 0) { siraIcon = '<i class="fa-solid fa-crown text-warning fa-2x"></i>'; satirClass = "bg-warning bg-opacity-10"; } 
            else if(index === 1) siraIcon = '<i class="fa-solid fa-medal text-secondary fa-2x"></i>';
            else if(index === 2) siraIcon = '<i class="fa-solid fa-medal text-danger fa-2x" style="color: #cd7f32 !important;"></i>';
            else siraIcon = `<span class="fw-bold fs-5 text-muted">#${index + 1}</span>`;

            let rutbe = "Acemi";
            if(uye.puan >= 50) rutbe = "Tarih Kalfası";
            if(uye.puan >= 150) rutbe = "Tarih Ustası";
            if(uye.puan >= 300) rutbe = "Bilge Kağan";
            if(uye.puan >= 500) rutbe = "Cihan Hakanı";
            if(uye.puan >= 1000) rutbe = "Ebedi Kahraman";

            html += `
            <tr class="${satirClass}">
                <td class="ps-4 text-center align-middle">${siraIcon}</td>
                <td><div class="d-flex align-items-center"><div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3 fw-bold" style="width: 40px; height: 40px; font-size: 1.2rem;">${uye.ad.charAt(0)}</div><div><h5 class="mb-0 fw-bold text-dark">${uye.kadi}</h5><small class="text-muted">${uye.ad} ${uye.soyad}</small></div></div></td>
                <td class="align-middle"><span class="badge rounded-pill bg-light text-dark border">${rutbe}</span></td>
                <td class="text-end pe-4 align-middle"><span class="fw-bold fs-5 text-primary">${uye.puan}</span> P</td>
            </tr>`;
        });
        tabloGovdesi.innerHTML = html;
    } catch (error) { console.error("Liderlik tablosu güncellenemedi:", error); }
}

const siralamaVerileri = [
    [ { metin: "Büyük Hun Devleti'nin Kuruluşu", yil: -220 }, { metin: "Göktürk Devleti'nin Kuruluşu", yil: 552 }, { metin: "Malazgirt Savaşı", yil: 1071 }, { metin: "Osmanlı'nın Kuruluşu", yil: 1299 }, { metin: "İstanbul'un Fethi", yil: 1453 } ],
    [ { metin: "Tanzimat Fermanı", yil: 1839 }, { metin: "I. Meşrutiyet", yil: 1876 }, { metin: "Çanakkale Savaşı", yil: 1915 }, { metin: "TBMM'nin Açılışı", yil: 1920 }, { metin: "Cumhuriyetin İlanı", yil: 1923 } ]
];
let mevcutSiralamaSeviyesi = 0;

function siralamaOyununuYukle() {
    const listeAlani = document.getElementById('siralama-listesi');
    const sonucAlani = document.getElementById('siralama-sonucu');
    const kontrolButonu = document.querySelector('#siralama-alani .btn-success'); 
    listeAlani.innerHTML = ""; sonucAlani.innerHTML = "";
    if (mevcutSiralamaSeviyesi >= siralamaVerileri.length) {
        listeAlani.innerHTML = `<div class="text-center py-4"><i class="fa-solid fa-trophy text-warning fa-4x mb-3"></i><h3 class="text-success">Tebrikler!</h3><p class="lead">Tüm zaman tüneli görevlerini tamamladın.</p></div>`;
        if(kontrolButonu) kontrolButonu.classList.add('d-none');
        return;
    }
    if(kontrolButonu) { kontrolButonu.classList.remove('d-none'); kontrolButonu.disabled = false; kontrolButonu.innerHTML = '<i class="fa-solid fa-check me-2"></i> Kontrol Et'; }

    let veriler = [...siralamaVerileri[mevcutSiralamaSeviyesi]];
    veriler.sort(() => Math.random() - 0.5);

    veriler.forEach(veri => {
        const item = document.createElement('div');
        item.className = "list-group-item siralama-ogesi";
        item.draggable = true; item.setAttribute('data-yil', veri.yil);
        item.innerHTML = `<span><i class="fa-solid fa-grip-lines"></i> ${veri.metin}</span>`;
        item.addEventListener('dragstart', () => item.classList.add('surukleniyor'));
        item.addEventListener('dragend', () => item.classList.remove('surukleniyor'));
        listeAlani.appendChild(item);
    });

    listeAlani.addEventListener('dragover', (e) => {
        e.preventDefault();
        const suruklenen = document.querySelector('.surukleniyor');
        const altindakiEleman = getDragAfterElement(listeAlani, e.clientY);
        if (altindakiEleman == null) listeAlani.appendChild(suruklenen);
        else listeAlani.insertBefore(suruklenen, altindakiEleman);
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.siralama-ogesi:not(.surukleniyor)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) return { offset: offset, element: child };
        else return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function siralamayiKontrolEt() {
    const elemanlar = document.querySelectorAll('.siralama-ogesi');
    const kontrolButonu = document.querySelector('#siralama-alani .btn-success');
    let oncekiYil = -99999;
    let hataliVar = false;

    elemanlar.forEach(el => {
        const buYil = parseInt(el.getAttribute('data-yil'));
        if (buYil < oncekiYil) { el.classList.add('yanlis'); el.classList.remove('dogru'); hataliVar = true; } 
        else { el.classList.remove('yanlis'); el.classList.add('dogru'); }
        oncekiYil = buYil;
    });

    const sonucAlani = document.getElementById('siralama-sonucu');
    if (!hataliVar) {
        if(kontrolButonu) { kontrolButonu.disabled = true; kontrolButonu.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yükleniyor...'; }
        sonucAlani.innerHTML = '<span class="text-success">✅ Tebrikler! Doğru Sıralama.</span>';
        puanVer(50);
        let puanSpan = document.getElementById('siralama-puani');
        let puan = parseInt(puanSpan.innerText) + 50;
        puanSpan.innerText = puan;
        setTimeout(() => { mevcutSiralamaSeviyesi++; siralamaOyununuYukle(); }, 2000);
    } else {
        sonucAlani.innerHTML = '<span class="text-danger">❌ Hatalı sıralama var, tekrar dene!</span>';
        setTimeout(() => { elemanlar.forEach(el => el.classList.remove('yanlis', 'dogru')); sonucAlani.innerHTML = ""; }, 1500);
    }
}

async function sifreGuncelle() {
  
    const eskiSifreInput = document.getElementById('modal-eski-sifre');
    const yeniSifreInput = document.getElementById('modal-yeni-sifre');
    const yeniSifreTekrarInput = document.getElementById('modal-yeni-sifre-tekrar');

    const eskiSifre = eskiSifreInput.value;
    const yeniSifre = yeniSifreInput.value;
    const yeniSifreTekrar = yeniSifreTekrarInput.value;
    
    if (yeniSifre !== yeniSifreTekrar) {
        alert("❌ Yeni şifreler birbiriyle uyuşmuyor!");
        return;
    }
    
    if (yeniSifre.length < 5) {
        alert("⚠️ Yeni şifreniz en az 5 karakter olmalı.");
        return;
    }

    const kullanici = mevcutKullaniciyiGetir();
    if (!kullanici) {
        alert("Oturum hatası! Lütfen tekrar giriş yapın.");
        return;
    }

    try {
        const response = await fetch('/api/sifre-degistir', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: kullanici.id,
                eskiSifre: eskiSifre,
                yeniSifre: yeniSifre
            })
        });

        const sonuc = await response.json();

        if (sonuc.success) {
            alert("✅ " + sonuc.message);
            
            eskiSifreInput.value = "";
            yeniSifreInput.value = "";
            yeniSifreTekrarInput.value = "";

            const modalElement = document.getElementById('sifreModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            
        } else {
            alert("❌ Hata: " + sonuc.message);
        }

    } catch (err) {
        console.error(err);
        alert("Sunucu bağlantı hatası!");
    }
}

let aktifGunlukSoru = null;

async function gunlukGorevAc() {
    const kullanici = mevcutKullaniciyiGetir();
    if (!kullanici) { alert("Önce giriş yapmalısın!"); return; }

  
    const modalEl = document.getElementById('gunlukGorevModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    const govde = document.getElementById('gunlukGorevGovde');
    govde.innerHTML = '<div class="spinner-border text-danger"></div><p class="mt-2">Görev kontrol ediliyor...</p>';

    try {
        const res = await fetch('/api/gunluk-gorev-kontrol', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ kullaniciId: kullanici.id })
        });
        const data = await res.json();

        if (data.oynandi) {
           
            govde.innerHTML = `
                <i class="fa-solid fa-hourglass-end text-muted fa-4x mb-3"></i>
                <h4 class="fw-bold">Görevi Zaten Tamamladın!</h4>
                <p class="text-muted">Yeni görev için gece 00:00'ı bekle.</p>
                <button class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Tamam</button>
            `;
        } else if (data.soru) {
           
            aktifGunlukSoru = data.soru;
            govde.innerHTML = `
                <span class="badge bg-warning text-dark mb-3">Ödül: 50 Puan</span>
                <h5 class="mb-4 fw-bold text-dark">${data.soru.soru_metni}</h5>
                <div class="d-grid gap-2 text-start">
                    <button class="btn btn-outline-dark p-3 gunluk-sik" onclick="gunlukCevapVer('a')">A) ${data.soru.sik_a}</button>
                    <button class="btn btn-outline-dark p-3 gunluk-sik" onclick="gunlukCevapVer('b')">B) ${data.soru.sik_b}</button>
                    <button class="btn btn-outline-dark p-3 gunluk-sik" onclick="gunlukCevapVer('c')">C) ${data.soru.sik_c}</button>
                    <button class="btn btn-outline-dark p-3 gunluk-sik" onclick="gunlukCevapVer('d')">D) ${data.soru.sik_d}</button>
                </div>
            `;
        } else {
            govde.innerHTML = "Soru yüklenirken hata oluştu veya soru havuzu boş.";
        }

    } catch (err) {
        console.error(err);
        govde.innerHTML = "Sunucu hatası.";
    }
}

async function gunlukCevapVer(secilenSik) {
    if (!aktifGunlukSoru) return;

    const butonlar = document.querySelectorAll('.gunluk-sik');
    butonlar.forEach(b => b.disabled = true); 

    const dogruCevap = aktifGunlukSoru.dogru_cevap;
    const govde = document.getElementById('gunlukGorevGovde');
    const kullanici = mevcutKullaniciyiGetir();

    if (secilenSik === dogruCevap) {
      
        govde.innerHTML = `
            <i class="fa-solid fa-gift text-success fa-5x mb-3 animasyon-goster"></i>
            <h3 class="text-success fw-bold">Harikasın!</h3>
            <p>Doğru cevap verdin ve <span class="fw-bold text-warning">50 Puan</span> kazandın.</p>
            <button class="btn btn-success rounded-pill px-4" data-bs-dismiss="modal">Kapat</button>
        `;
        
        await fetch('/api/gunluk-gorev-tamamla', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ kullaniciId: kullanici.id, puan: 50 })
        });

        puanVer(50); 

    } else {
        
        govde.innerHTML = `
            <i class="fa-solid fa-heart-crack text-danger fa-5x mb-3 animasyon-goster"></i>
            <h3 class="text-danger fw-bold">Maalesef Yanlış...</h3>
            <p>Doğru cevap: <strong>${dogruCevap.toUpperCase()}</strong> şıkkıydı.</p>
            <p class="text-muted small">Bugünkü şansını kullandın. Yarın tekrar dene!</p>
            <button class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Kapat</button>
        `;

       
        await fetch('/api/gunluk-gorev-tamamla', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ kullaniciId: kullanici.id, puan: 0 })
        });
    }
}