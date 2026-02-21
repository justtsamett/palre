window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const welcome = document.getElementById('welcome-screen');
        welcome.style.opacity = '0';
        setTimeout(() => {
            welcome.style.display = 'none';
            document.getElementById('main-container').classList.remove('hidden');
            setTimeout(() => {
                document.querySelector('.liquid').style.bottom = '-10%'; 
            }, 500);
        }, 1500);
    }, 3500);
});

async function askPALRE() {
    const input = document.getElementById('user-input');
    const box = document.getElementById('response-box');
    const text = input.value.trim();

    if (!text) return;

    input.value = "";
    box.innerText = "Sinyal iletiliyor...";

    try {
        const response = await fetch("/api/ask-palre", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: text })
        });

        const data = await response.json();
        console.log("Gelen Veri:", data); // Sorun varsa burada görünecek

        if (data.choices && data.choices[0]) {
            typeWriter(data.choices[0].message.content, "response-box");
        } else {
            // Hata mesajını ekrana yazdır ki ne olduğunu anlayalım
            box.innerText = "Hata: " + (data.error?.message || data.error || "Bilinmeyen bir hata oluştu.");
        }
    } catch (err) {
        box.innerText = "Bağlantı Hatası: Sunucuya ulaşılamıyor.";
        console.error("Fetch Hatası:", err);
    }
}

function typeWriter(text, elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = "";
    let i = 0;
    const interval = setInterval(() => {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
        } else {
            clearInterval(interval);
        }
    }, 25);
}

document.getElementById('send-btn').addEventListener('click', askPALRE);
document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') askPALRE();
});
