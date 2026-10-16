# Cek Resi SPX Express (Cloudflare Pages)

Hasil tracking muncul **langsung di aplikasi**.

## Struktur Folder (penting)

```
cek-resi-spx/                  ← root repository
├── functions/
│   └── api/
│       └── track.js           ← Backend API
├── index.html                 ← Frontend
├── manifest.json
├── sw.js
├── icon-192.png
├── icon-512.png
├── README.md
└── .gitignore
```

## Cara Deploy ke Cloudflare Pages

1. Upload / ganti semua file di repository GitHub kamu sesuai struktur di atas
2. Buka [dash.cloudflare.com](https://dash.cloudflare.com) → Login
3. Masuk ke **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
4. Pilih repository `cek-resi-spx`
5. Setting:
   - **Framework preset**: None
   - **Build command**: (kosongkan)
   - **Build output directory**: `/` (atau biarkan kosong)
6. Klik **Save and Deploy**

Setelah selesai, kamu dapat URL seperti:
`https://cek-resi-spx.pages.dev`

## Fitur
- PDA Scanner ready
- Scan kamera
- Hasil tracking langsung di aplikasi (via Cloudflare Function)
- History (localStorage)
- PWA
