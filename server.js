const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const HISTORY_FILE = path.join(__dirname, 'data', 'history.json');

if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, '[]');
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function loadHistory() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveHistory(data) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
}

function cleanResi(text) {
  if (!text) return '';
  let cleaned = String(text).trim().toUpperCase();
  const match = cleaned.match(/SPX[A-Z0-9]{8,}/i);
  if (match) return match[0].toUpperCase();
  return cleaned.replace(/[^A-Z0-9]/g, '');
}

app.get('/api/track', async (req, res) => {
  try {
    let resi = cleanResi(req.query.resi || '');
    if (!resi || resi.length < 8) {
      return res.status(400).json({ success: false, message: 'Nomor resi tidak valid' });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const secrets = [
      'MGViZmZmZTYzZDJhNDgxY2Y1N2ZlN2Q1ZWJkYzlmZDY=',
      '0ebfffe63d2a481cf57fe7d5ebdc9fd6',
      'MGViZmZmZTYzZDJhNDgxY2Y1N2ZlN2Q1ZWJkYzlmZDY'
    ];

    let result = null;

    for (const secret of secrets) {
      try {
        const raw = resi + timestamp + secret;
        const hash = sha256(raw);
        const url = `https://spx.co.id/api/v2/fleet_order/tracking/search?sls_tracking_number=${encodeURIComponent(resi)}|${timestamp}${hash}`;

        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });

        if (!response.ok) continue;

        const data = await response.json();
        if (data && (data.data || data.retcode === 0)) {
          result = data;
          break;
        }
      } catch (e) {}
    }

    // Simpan history
    const history = loadHistory();
    history.unshift({
      resi,
      time: new Date().toISOString(),
      success: !!result,
      status: result?.data?.status || result?.data?.current_status || (result ? 'Ditemukan' : 'Gagal')
    });
    if (history.length > 100) history.length = 100;
    saveHistory(history);

    if (result) {
      return res.json({ success: true, resi, data: result });
    }

    return res.json({
      success: false,
      resi,
      message: 'Gagal mengambil data dari SPX. Silakan coba lagi atau buka situs resmi.',
      officialUrl: `https://spx.co.id/?trackingNumber=${encodeURIComponent(resi)}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/history', (req, res) => {
  res.json({ success: true, data: loadHistory() });
});

app.delete('/api/history', (req, res) => {
  saveHistory([]);
  res.json({ success: true, message: 'History dihapus' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Cek Resi SPX running on port ${PORT}`);
});
