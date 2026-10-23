require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.static('public'));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

app.post('/upload', upload.array('photos', 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ ok: false, error: 'لا توجد صور' });
    }

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const form = new FormData();
      form.append('chat_id', process.env.CHAT_ID);
      form.append('caption', `📸 صورة ${i + 1} من ${req.files.length}`);
      form.append('photo', fs.createReadStream(file.path));

      await axios.post(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`,
        form,
        { headers: form.getHeaders(), maxBodyLength: Infinity }
      );

      fs.unlinkSync(file.path);
    }

    res.json({ ok: true, count: req.files.length });
  } catch (err) {
    console.error('Telegram error:', err.response?.data || err.message);
    req.files?.forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
