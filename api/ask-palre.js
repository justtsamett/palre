export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir.' });
    }

    const { prompt } = req.body;
    // Vercel panelinde GITHUB_TOKEN olarak girdiğinden emin ol
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    if (!GITHUB_TOKEN) {
        return res.status(500).json({ error: 'API anahtarı Vercel üzerinde bulunamadı. Lütfen Environment Variables kısmını kontrol et.' });
    }

    try {
        const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GITHUB_TOKEN}`
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "Senin adın P.A.L.R.E. Samet'in asil ve zeki yardımcısısın. Cevapların kısa, teknolojik ve saygılı olsun." },
                    { role: "user", content: prompt }
                ],
                model: "gpt-4o",
                temperature: 0.7
            })
        });

        const data = await response.json();

        // GitHub'dan hata gelirse onu yakalayalım
        if (!response.ok) {
            return res.status(response.status).json({ error: data.error || 'GitHub API Hatası' });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası: " + error.message });
    }
}
