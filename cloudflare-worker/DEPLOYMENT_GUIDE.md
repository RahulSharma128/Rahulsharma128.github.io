# 🚀 Cloudflare Worker Deployment Guide

Follow these 3 simple steps to deploy your Virtual Self RAG API to Cloudflare Edge:

---

## 1️⃣ Login to Cloudflare via CLI
Open your terminal inside the `cloudflare-worker` directory and run:

```bash
cd cloudflare-worker
npx wrangler login
```
*This opens your browser to authenticate your free Cloudflare account.*

---

## 2️⃣ Create Cloudflare Vectorize Index
Run this command to create your vector index on Cloudflare:

```bash
npx wrangler vectorize create rahul-portfolio-index --dimensions=384 --metric=cosine
```

---

## 3️⃣ Set Secret API Key & Deploy!
Add your Google Gemini API Key (get a free key at [aistudio.google.com](https://aistudio.google.com/)):

```bash
npx wrangler secret put GEMINI_API_KEY
# Paste your Gemini API key when prompted
```

Now deploy your Worker to the edge:

```bash
npx wrangler deploy
```

---

## 🔗 Connect to GitHub Pages Site
After running `npx wrangler deploy`, Wrangler will output your live URL:
`https://rahul-virtual-self-api.<your-subdomain>.workers.dev`

Simply open [`script.js`](file:///home/ubuntu/Rahulsharma128.github.io/script.js) and paste your URL at line 1063:
```javascript
window.CONFIG.CF_WORKER_URL = 'https://rahul-virtual-self-api.<your-subdomain>.workers.dev';
```

Done! Your Virtual Self AI is live and responding globally! 🎉
