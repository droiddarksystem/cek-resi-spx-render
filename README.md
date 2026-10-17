# Cek Resi SPX Express (Cloudflare Workers)

## Struktur
```
cek-resi-spx-render/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── sw.js
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   └── index.js          ← Worker (API + routing)
├── wrangler.toml
├── package.json
└── README.md
```

## Cara Update di GitHub
1. Hapus file lama (functions/, index.html di root, dll)
2. Upload struktur di atas
3. Di Cloudflare dashboard → Retry deploy / Redeploy

Atau dari komputer:
```bash
npm install
npx wrangler deploy
```
