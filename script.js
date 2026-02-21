// Başlangıç Animasyon Yönetimi
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const welcomeScreen = document.getElementById('welcome-screen');
        welcomeScreen.style.opacity = '0';
        
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
            const main = document.getElementById('main-container');
            main.classList.remove('hidden');
            
            // Mavi sıvı dolma animasyonu
            setTimeout(() => {
                document.querySelector('.liquid').style.bottom = '0';
            }, 500);
        }, 1000);
    }, 4000);
});

// P.A.L.R.E ile Konuşma Fonksiyonu
async function askPALRE() {
    const inputField = document.getElementById('user-input');
    const responseBox = document.getElementById('response-box');
    const prompt = inputField.value.trim();
    
    if(!prompt) return;

    inputField.value = "";
    responseBox.innerText = "Sinyal gönderiliyor, yanıt bekleniyor...";

    try {
        // Kendi Vercel API endpoint'imize istek atıyoruz
        const response = await fetch("/api/ask-palre", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: prompt })
        });
        
        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            responseBox.innerText = data.choices[0].message.content;
        } else {
            responseBox.innerText = "P.A.L.R.E şu an yanıt veremiyor.";
        }
    } catch (error) {
        responseBox.innerText = "Bağlantı kesildi. Lütfen internetinizi kontrol edin.";
        console.error("Hata:", error);
    }
}

// Event Listeners
document.getElementById('send-btn').addEventListener('click', askPALRE);
document.getElementById('user-input').addEventListener('keypress', (e) => {
    if(e.key === 'Enter') askPALRE();
});
