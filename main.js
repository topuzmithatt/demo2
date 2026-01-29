// =====================================================
// KAPALI KALE TARAFTARLAR DERNEĞİ - JAVASCRIPT
// Google Forms Entegrasyonu & UI Kontrolleri
// =====================================================

// 1. GOOGLE FORMS AYARLARI (GÜNCELLENDİ)
const GOOGLE_FORMS = {
    // Deplasman Formu
    deployment: {
        url: 'https://docs.google.com/forms/d/e/1FAIpQLScq4gWAKF6c5RjzBfVuEAwBdTSjvcHrz4MdlGLBR1TrVb2k7w/formResponse',
        fields: {
            fullName: 'entry.453360435',      // İsim Soyisim
            phone: 'entry.1885755863',        // Tel No
            email: 'entry.1931708297',        // Mail (YENİ EKLENDİ)
            passoCheck: 'entry.1459692919',   // Passolig Durumu
            visaCheck: 'entry.406397246'      // Vize Durumu
        }
    },

    // İletişim Formu
    contact: {
        url: 'https://docs.google.com/forms/d/e/1FAIpQLSfNWnzpeRq4Kk21WO5V6RSRSaMHnc6r4Sosmm2X5Gk34HR5Sg/formResponse',
        fields: {
            contactName: 'entry.432520600',    // Ad
            contactEmail: 'entry.1250474398',  // E-posta
            contactSubject: 'entry.1012014838',// Konu
            contactMessage: 'entry.728662554'  // Mesaj
        }
    }
};

// =====================================================
// DOM ELEMENTLERİ VE UI BAŞLANGIÇ
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔥 Kapalı Kale - Form Sistemi Aktif!');
    highlightActiveMenu();

    // Deplasman formu varsa kontrolleri başlat
    if (document.getElementById('membershipForm')) {
        initDeplasmanLogic();
    }
    
    // İletişim formu varsa kontrolleri başlat
    if (document.getElementById('contactForm')) {
        initContactLogic();
    }

    // Tayfalarımız sayfasındaki animasyonlar için (Eğer varsa)
    if (typeof AOS !== 'undefined') {
        AOS.init();
    }
});

// AKTİF MENÜ İŞARETLEME
function highlightActiveMenu() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

// =====================================================
// DEPLASMAN FORMU MANTIĞI VE GÖNDERİMİ
// =====================================================
function initDeplasmanLogic() {
    const form = document.getElementById('membershipForm');
    const passoRadios = document.getElementsByName('passoCheck');
    const visaRadios = document.getElementsByName('visaCheck');
    const visaCards = document.querySelectorAll('.visa-group .radio-card');
    const warningBox = document.getElementById('passoWarning');
    
    // Passolig Durum Kontrolü (Görsel Kilitleme)
    passoRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'Hayır') {
                visaRadios.forEach(r => { r.checked = false; r.disabled = true; });
                visaCards.forEach(card => card.classList.add('disabled'));
                warningBox.style.display = 'block';
                warningBox.textContent = "⚠️ Passolig olmadan maça giriş yapamazsınız.";
            } else {
                visaRadios.forEach(r => r.disabled = false);
                visaCards.forEach(card => card.classList.remove('disabled'));
                warningBox.style.display = 'none';
            }
        });
    });

    // FORM GÖNDERİMİ
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Verileri Al
        const formData = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email')?.value || '', // Email eklendi
            passoCheck: document.querySelector('input[name="passoCheck"]:checked')?.value,
            visaCheck: document.querySelector('input[name="visaCheck"]:checked')?.value
        };

        // KONTROLLER
        if (formData.passoCheck === 'Hayır') {
            alert('❌ Passolig kartınız olmadan başvuru yapamazsınız.');
            return;
        }
        if (formData.visaCheck === 'Hayır') {
            alert('❌ Passo Kartınızın vizesi olmadan maça giriş yapamazsınız.');
            return;
        }

        // Gönderim Başlıyor Butonu Kilitle
        const btn = form.querySelector('button[type="submit"]');
        const oldText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'GÖNDERİLİYOR...';

        try {
            await submitToGoogleForm(GOOGLE_FORMS.deployment.url, GOOGLE_FORMS.deployment.fields, formData);
            alert('✅ Başvurunuz başarıyla alındı! Tribünde görüşmek üzere.');
            form.reset();
            // Reset sonrası UI düzeltmeleri
            visaCards.forEach(card => card.classList.remove('disabled'));
            warningBox.style.display = 'none';
        } catch (error) {
            console.error(error);
            alert('❌ Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            btn.disabled = false;
            btn.textContent = oldText;
        }
    });
}

// =====================================================
// İLETİŞİM FORMU MANTIĞI
// =====================================================
function initContactLogic() {
    const form = document.getElementById('contactForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            contactName: document.getElementById('contactName').value,
            contactEmail: document.getElementById('contactEmail').value,
            // Konu alanı formda yoksa varsayılan atayalım
            contactSubject: document.getElementById('contactSubject')?.value || 'Web Sitesi Mesajı', 
            contactMessage: document.getElementById('contactMessage').value
        };

        const btn = form.querySelector('button[type="submit"]');
        const oldText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'GÖNDERİLİYOR...';

        try {
            await submitToGoogleForm(GOOGLE_FORMS.contact.url, GOOGLE_FORMS.contact.fields, formData);
            alert('✅ Mesajınız iletildi. Teşekkürler!');
            form.reset();
        } catch (error) {
            console.error(error);
            alert('❌ Mesaj gönderilemedi.');
        } finally {
            btn.disabled = false;
            btn.textContent = oldText;
        }
    });
}

// =====================================================
// GOOGLE FORMS GÖNDERİM FONKSİYONU (Standart)
// =====================================================
function submitToGoogleForm(formUrl, fieldMapping, data) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        
        // Google Forms ID'leri ile verileri eşleştir
        for (const key in data) {
            if (fieldMapping[key]) {
                formData.append(fieldMapping[key], data[key]);
            }
        }

        // Görünmez iframe oluştur (Sayfa yenilenmesini engellemek için)
        const iframeId = 'hidden_iframe_' + Date.now();
        const iframe = document.createElement('iframe');
        iframe.setAttribute('id', iframeId);
        iframe.setAttribute('name', iframeId);
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        // Geçici form oluştur ve iframe'e post et
        const form = document.createElement('form');
        form.action = formUrl;
        form.method = 'POST';
        form.target = iframeId;

        for (const pair of formData.entries()) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = pair[0];
            input.value = pair[1];
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();

        // Temizlik ve Başarılı Dönüş
        setTimeout(() => {
            document.body.removeChild(form);
            document.body.removeChild(iframe);
            resolve();
        }, 1000); // Google Forms genelde hızlı yanıt verir ama garanti olsun diye 1sn bekliyoruz
    });
}