export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { messages } = req.body; // Artık sadece tek bir prompt değil, dizi alıyoruz
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
                        content: "Senin adın P.A.L.R.E. Samet'in asil yardımcısısın. Konuşma geçmişine ve kullanıcının kişisel bilgilerine hakimsin. Eğer kullanıcı kendisi hakkında kalıcı bir bilgi verirse bunu hatırla." 
                    },
                    ...messages // Geçmiş mesajlar buraya ekleniyor
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
