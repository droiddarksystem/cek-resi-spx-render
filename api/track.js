const crypto = require('crypto');

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function cleanResi(text) {
  if (!text) return '';
  let cleaned = String(text).trim().toUpperCase();
  const match = cleaned.match(/SPX[A-Z0-9]{8,}/i);
  if (match) return match[0].toUpperCase();
  return cleaned.replace(/[^A-Z0-9]/g, '');
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const resi = cleanResi(req.query.resi || '');
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
          }
        });

        if (!response.ok) continue;

        const data = await response.json();
        if (data && (data.data || data.retcode === 0)) {
          result = data;
          break;
        }
      } catch (e) {
        // coba secret berikutnya
      }
    }

    if (result) {
      return res.status(200).json({
        success: true,
        resi,
        data: result
      });
    }

    return res.status(200).json({
      success: false,
      resi,
      message: 'Gagal mengambil data dari SPX. Silakan coba lagi atau buka situs resmi.',
      officialUrl: `https://spx.co.id/?trackingNumber=${encodeURIComponent(resi)}`
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
