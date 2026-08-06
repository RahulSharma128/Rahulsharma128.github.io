# Cloudflare Worker Contact Form Setup Guide

This portfolio uses a **Cloudflare Worker** API endpoint to process contact form submissions securely without third-party email widgets like EmailJS.

---

## 🚀 1. Deploying your Cloudflare Worker

### Step 1: Create a Worker in Cloudflare
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** -> **Create Application** -> **Create Worker**.
3. Name your worker (e.g. `portfolio-contact`) and click **Deploy**.

### Step 2: Add Worker Code
1. Click **Edit Code** in your new worker dashboard.
2. Open [`cloudflare-worker/worker.js`](file:///home/ubuntu/Rahulsharma128.github.io/cloudflare-worker/worker.js) from this repository.
3. Copy the entire content of `worker.js` and paste it into the Cloudflare Worker code editor.
4. Click **Save and Deploy**.

### Step 3: Configure Environment Variables (Optional)
In your Cloudflare Worker Settings -> **Variables**:
- `DESTINATION_EMAIL`: Set to your email address (default: `shrahul520@gmail.com`).
- `RESEND_API_KEY`: (Optional) Add your Resend.com API Key if using Resend for email delivery.

---

## 🔗 2. Update Website Configuration

1. Copy your deployed Cloudflare Worker URL (e.g. `https://portfolio-contact.yourname.workers.dev`).
2. Open [`index.html`](file:///home/ubuntu/Rahulsharma128.github.io/index.html).
3. Update `CLOUDFLARE_WORKER_URL` in the `window.CONFIG` script block:

```javascript
window.CONFIG = {
    CLOUDFLARE_WORKER_URL: 'https://your-worker-name.your-subdomain.workers.dev',
    RECAPTCHA: {
        SITE_KEY: 'your_recaptcha_site_key'
    }
};
```

---

## 🧪 3. Testing Form Submissions

1. Open your portfolio locally or on GitHub Pages.
2. Navigate to the **Contact** section.
3. Fill out the form, complete the reCAPTCHA verification, and click **Send Message**.
4. Check your email inbox!
