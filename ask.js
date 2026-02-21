export default async function handler(req, res) {
    // Sadece POST isteklerini kabul et
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir.' });
    }

    const { prompt } = req.body;
    // Vercel panelinde tanımladığın değişkeni buradan okuyoruz
    const GITHUB_TOKEN = process.env.github_token; 

    try {
        const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GITHUB_TOKEN}`
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "Sen P.A.L.R.E asistanısın. Samet'in sadık yardımcısısın. Cevapların asil ve teknolojik bir tonda olmalı." },
                    { role: "user", content: prompt }
                ],
                model: "gpt-4o",
                temperature: 0.7
            })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Sunucu tarafında bir hata oluştu." });
    }
}
