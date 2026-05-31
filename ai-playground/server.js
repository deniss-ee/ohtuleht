require('dotenv').config();
const express = require('express');
const multer = require('multer');
const Groq = require('groq-sdk');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(__dirname)));

app.post('/edit-photo', upload.single('photo'), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });

    const form = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    form.append('image', blob, req.file.originalname || 'photo.jpg');
    form.append('prompt', `${prompt} Do not alter any faces, people, or their expressions in any way. Only adjust color grading, lighting mood, and overall tone.`);
    form.append('model', 'gptimage-large');

    const headers = { Authorization: `Bearer ${process.env.POLLINATIONS_KEY}` };

    const polRes = await fetch('https://gen.pollinations.ai/v1/images/edits', {
      method: 'POST',
      headers,
      body: form,
    });

    if (!polRes.ok) {
      const errText = await polRes.text();
      return res.status(polRes.status).json({ error: errText || `Pollinations error ${polRes.status}` });
    }

    const contentType = polRes.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const json = await polRes.json();
      const b64 = json?.data?.[0]?.b64_json;
      if (!b64) return res.status(500).json({ error: 'No image in Pollinations response' });
      res.json({ image: b64, mimeType: 'image/png' });
    } else {
      const buffer = Buffer.from(await polRes.arrayBuffer());
      res.json({ image: buffer.toString('base64'), mimeType: contentType || 'image/jpeg' });
    }
  } catch (err) {
    console.error('edit-photo error:', err);
    res.status(500).json({ error: err.message || 'Image editing failed' });
  }
});

app.post('/generate-article', async (req, res) => {
  try {
    const { mood, lighting, style } = req.body;

    const prompt = `Write a short news article (3-4 sentences) for a news photo with the following characteristics: mood is ${mood}, lighting is ${lighting}, visual style is ${style}. Write it as a real news article with a headline. English language. Keep it neutral and journalistic in tone. Return JSON only, no markdown, in this format: { "headline": string, "body": string }`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json(parsed);
  } catch (err) {
    console.error('generate-article error:', err);
    res.status(500).json({ error: err.message || 'Article generation failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
