function cleanResi(text) {
  if (!text) return '';
  let cleaned = String(text).trim().toUpperCase();
  const match = cleaned.match(/SPX[A-Z0-9]{8,}/i);
  if (match) return match[0].toUpperCase();
  return cleaned.replace(/[^A-Z0-9]/g, '');
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest(context) {
  const { request } = context;

  // CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(request.url);
    const resi = cleanResi(url.searchParams.get('resi') || '');

    if (!resi || resi.length < 8) {
      return new Response(JSON.stringify({ success: false, message: 'Nomor resi tidak valid' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
        const hash = await sha256(raw);
        const apiUrl = `https://spx.co.id/api/v2/fleet_order/tracking/search?sls_tracking_number=${encodeURIComponent(resi)}|${timestamp}${hash}`;

        const response = await fetch(apiUrl, {
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
      return new Response(JSON.stringify({ success: true, resi, data: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      resi,
      message: 'Gagal mengambil data dari SPX. Silakan coba lagi atau buka situs resmi.',
      officialUrl: `https://spx.co.id/?trackingNumber=${encodeURIComponent(resi)}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
