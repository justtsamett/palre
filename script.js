// Hafıza Yönetim Objesi
const Memory = {
    // Kısa süreli hafızayı getir (Son 10 mesaj)
    getShortTerm() {
        const history = sessionStorage.getItem('palre_chat_history');
        return history ? JSON.parse(history) : [];
    },

    // Uzun süreli kişisel verileri getir
    getLongTerm() {
        return localStorage.getItem('palre_user_profile') || "Henüz kişisel bilgi yok.";
    },

    // Yeni mesajı hafızaya ekle
    save(role, content) {
        let history = this.getShortTerm();
        history.push({ role, content });
        
        // Sadece son 10 mesajı tut (5 Kullanıcı + 5 Asistan gibi)
        if (history.length > 10) history.shift();
        
        sessionStorage.setItem('palre_chat_history', JSON.stringify(history));
    }
};

async function askPALRE() {
    const input = document.getElementById('user-input');
    const box = document.getElementById('response-box');
    const userText = input.value.trim();

    if (!userText) return;
    input.value = "";
    box.innerText = "İşleniyor...";

    // 1. Kullanıcı mesajını hafızaya kaydet
    Memory.save("user", userText);

    // 2. Hafızayı hazırla (Long Term + Short Term)
    const longTermContext = `Kullanıcı Bilgileri: ${Memory.getLongTerm()}`;
    const fullMessages = [
        { role: "system", content: longTermContext },
        ...Memory.getShortTerm()
    ];

    try {
        const response = await fetch("/api/ask-palre", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: fullMessages })
        });

        const data = await response.json();
        const aiText = data.choices[0].message.content;

        // 3. AI cevabını hafızaya kaydet
        Memory.save("assistant", aiText);
        
        // Ekrana yazdır
        typeWriter(aiText, "response-box");

    } catch (err) {
        box.innerText = "Hafıza erişim hatası.";
    }
}
