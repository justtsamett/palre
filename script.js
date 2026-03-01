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
    }
};

const PALRE = {
    recognition: null,
    isListening: false,

    // 1. SESLENDİRME (TTS)
    async speak(text) {
        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'tr-TR';
            utterance.rate = 0.95; // Asil ve tok bir hız
            utterance.pitch = 0.8; // Hafif kalın, karizmatik ses
            utterance.onend = resolve;
            window.speechSynthesis.speak(utterance);
        });
    },

    // 2. SES TANIMA (STT)
    initSTT() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return console.error("Tarayıcı desteklemiyor.");

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'tr-TR';
        this.recognition.interimResults = true; // Konuşurken metne dök

        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            
            document.getElementById('user-input').value = transcript;

            if (event.results[0].isFinal) {
                setTimeout(() => askPALRE(), 500); // Cümle bitince gönder
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            document.querySelector('.circle-wrapper').classList.remove('listening');
        };
    },

    listen() {
        if (this.isListening) return;
        try {
            this.recognition.start();
            this.isListening = true;
            document.querySelector('.circle-wrapper').classList.add('listening');
        } catch (e) { console.error("Mikrofon hatası:", e); }
    }
};

const UI = {
    init() {
        PALRE.initSTT();
        this.setupListeners();
        this.startIntro();
    },
    setupListeners() {
        document.getElementById('send-btn').addEventListener('click', () => askPALRE());
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') askPALRE();
        });
    },
    startIntro() {
        setTimeout(() => {
            document.getElementById('welcome-screen').style.opacity = '0';
            setTimeout(async () => {
                document.getElementById('welcome-screen').style.display = 'none';
                document.getElementById('main-container').classList.remove('hidden');
                document.querySelector('.liquid').style.bottom = '-10%';

                // Daire dolunca (5sn sonra)
                setTimeout(async () => {
                    await PALRE.speak("Hoşgeldiniz efendim. P.A.L.R.E sistemleri aktif. Sizi dinliyorum.");
                    PALRE.listen(); // Mikrofonu aç
                }, 5000);
            }, 1500);
        }, 2000);
    }
};

async function askPALRE() {
    const input = document.getElementById('user-input');
    const box = document.getElementById('response-box');
    const userText = input.value.trim();

    if (!userText) return;
    input.value = "";
    box.innerText = "Sinyal işleniyor...";

    Memory.saveToShort("user", userText);

    const fullMessages = [
        { role: "system", content: "Sistem Hafızası: " + Memory.getLongTerm() },
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

        // Hafıza Kaydı Kontrolü
        const saveMatch = aiText.match(/\[SAVE:(.*?)\]/);
        if (saveMatch) {
            Memory.saveToLong(saveMatch[1]);
            aiText = aiText.replace(/\[SAVE:.*?\]/g, "");
        }

        Memory.saveToShort("assistant", aiText);
        
        // Önce yazdır, sonra konuş
        typeWriter(aiText, "response-box");
        await PALRE.speak(aiText); 
        
        // Konuşma bittikten sonra tekrar dinlemeye geçmesini istersen:
        PALRE.listen();

    } catch (err) {
        box.innerText = "Bağlantı hatası efendim.";
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

window.addEventListener('DOMContentLoaded', () => UI.init());
