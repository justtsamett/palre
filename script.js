const Memory = {
    getShortTerm() {
        const history = sessionStorage.getItem('palre_history');
        return history ? JSON.parse(history) : [];
    },
    getLongTerm() {
        return localStorage.getItem('palre_long_term') || "Henüz kaydedilmiş kişisel bilgi yok.";
    },
    saveToShort(role, content) {
        let history = this.getShortTerm();
        history.push({ role, content });
        if (history.length > 10) history.shift();
        sessionStorage.setItem('palre_history', JSON.stringify(history));
    },
    saveToLong(info) {
        let currentInfo = this.getLongTerm();
        let updatedInfo = currentInfo + " | " + info;
        localStorage.setItem('palre_long_term', updatedInfo);
        console.log("Sistem Notu: Long-term hafıza güncellendi.");
    }
};

const PALRE_UI = {
    init() {
        this.setupEventListeners();
        this.startIntro();
    },
    setupEventListeners() {
        document.getElementById('send-btn').addEventListener('click', () => askPALRE());
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') askPALRE();
        });
    },
    startIntro() {
        setTimeout(() => {
            document.getElementById('welcome-screen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('welcome-screen').style.display = 'none';
                document.getElementById('main-container').classList.remove('hidden');
                document.querySelector('.liquid').style.bottom = '-10%';
            }, 1500);
        }, 3000);
    }
};

async function askPALRE() {
    const input = document.getElementById('user-input');
    const box = document.getElementById('response-box');
    const userText = input.value.trim();

    if (!userText) return;
    input.value = "";
    box.innerText = "İşleniyor...";

    Memory.saveToShort("user", userText);

    const fullMessages = [
        { role: "system", content: "Kalıcı Hafıza Kayıtları: " + Memory.getLongTerm() },
        ...Memory.getShortTerm()
    ];

    try {
        const response = await fetch("/api/ask-palre", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: fullMessages })
        });

        const data = await response.json();
        let aiText = data.choices[0].message.content;

        // Akıllı Kayıt Kontrolü [SAVE:...]
        const saveMatch = aiText.match(/\[SAVE:(.*?)\]/);
        if (saveMatch) {
            Memory.saveToLong(saveMatch[1]);
            aiText = aiText.replace(/\[SAVE:.*?\]/g, ""); // Etiketi kullanıcıya gösterme
        }

        Memory.saveToShort("assistant", aiText);
        typeWriter(aiText, "response-box");
    } catch (err) {
        box.innerText = "Bağlantı kesildi efendim.";
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

window.addEventListener('DOMContentLoaded', () => PALRE_UI.init());
