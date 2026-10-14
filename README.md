# Cek Resi SPX Express (Vercel Ready)

Aplikasi cek resi SPX Express dengan hasil **langsung muncul di aplikasi** (tidak perlu buka situs resmi).

## Fitur
- Input manual + PDA Scanner (tembak barcode)
- Scan kamera (QR/Barcode)
- Backend API di Vercel (proxy SPX)
- Hasil tracking tampil di dalam aplikasi
- History (localStorage)
- PWA (bisa diinstall)

## Cara Deploy ke Vercel

### Cara 1: Lewat GitHub (Recommended)
1. Upload folder ini ke repository GitHub baru
2. Buka [vercel.com](https://vercel.com) → Login
3. Klik **Add New Project**
4. Import repository kamu
5. Klik **Deploy**

### Cara 2: Vercel CLI
```bash
npm i -g vercel
vercel
```

## Struktur
```
cek-resi-vercel/
├── api/
│   └── track.js          ← Backend (proxy SPX)
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── sw.js
│   ├── icon-192.png
│   └── icon-512.png
├── package.json
├── vercel.json
└── README.md
```

Setelah deploy, buka URL yang diberikan Vercel.
