require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json({ limit: '25mb' }));
app.use(express.static(path.join(__dirname)));

app.post('/edit-photo', upload.single('photo'), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-preview-image-generation' });

    const imageData = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype,
      },
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [imageData, { text: prompt }] }],
      generationConfig: { responseModalities: ['image', 'text'] },
    });

    const response = result.response;
    const parts = response.candidates[0].content.parts;

    let editedImageBase64 = null;
    let editedImageMime = 'image/jpeg';

    for (const part of parts) {
      if (part.inlineData) {
        editedImageBase64 = part.inlineData.data;
        editedImageMime = part.inlineData.mimeType;
        break;
      }
    }

    if (!editedImageBase64) {
      return res.status(500).json({ error: 'No image returned from Gemini' });
    }

    res.json({ image: editedImageBase64, mimeType: editedImageMime });
  } catch (err) {
    console.error('edit-photo error:', err);
    res.status(500).json({ error: err.message || 'Image editing failed' });
  }
});

app.post('/generate-article', async (req, res) => {
  try {
    const { mood, lighting, style } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Write a short news article (3-4 sentences) for a news photo with the following characteristics: mood is ${mood}, lighting is ${lighting}, visual style is ${style}. Write it as a real news article with a headline. English language. Keep it neutral and journalistic in tone. Return JSON only, no markdown, in this format: { "headline": string, "body": string }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    res.json(parsed);
  } catch (err) {
    console.error('generate-article error:', err);
    res.status(500).json({ error: err.message || 'Article generation failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
