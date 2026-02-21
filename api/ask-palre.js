export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { messages } = req.body;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    try {
        const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GITHUB_TOKEN}`
            },
            body: JSON.stringify({
                messages: [
                    { 
                        role: "system", 
                        content: "Senin adın P.A.L.R.E. Samet'in asil yardımcısısın. Konuşma geçmişine hakimsin. Eğer kullanıcı önemli bir bilgi verirse (isim, tercih, proje vb.) ve bunu hatırlamanı isterse, cevabının en sonuna [SAVE:hatırlanacak_bilgi] formatında bir ekleme yap. Bu ekleme kullanıcıya görünmeyecek ama sistemin onu kaydetmesini sağlayacak." 
                    },
                    ...messages
                ],
                model: "gpt-4o",
                temperature: 0.7
            })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
