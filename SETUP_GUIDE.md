# EmailJS and Cloudflare Turnstile Setup Guide

## 🚀 Quick Setup Steps

### 1. EmailJS Setup

1. **Create EmailJS Account**
   - Go to [https://www.emailjs.com/](https://www.emailjs.com/)
   - Sign up for a free account
   - Verify your email address

2. **Create Email Service**
   - Go to Email Services in your dashboard
   - Click "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the setup instructions
   - Copy your **Service ID**

3. **Create Email Template**
   - Go to Email Templates in your dashboard
   - Click "Create New Template"
   - Use this template:
   ```
   Subject: New Contact Form Message: {{subject}}
   
   From: {{from_name}} ({{from_email}})
   Subject: {{subject}}
   
   Message:
   {{message}}
   
   ---
   This message was sent from your portfolio contact form.
   ```
   - Save and copy your **Template ID**

4. **Get Public Key**
   - Go to Account > General
   - Copy your **Public Key**

### 2. Cloudflare Turnstile Setup

1. **Create Turnstile Widget**
   - Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Turnstile**
   - Click **Add Widget**
   - Enter your site name and domain (e.g. `rahulsharma128.github.io` or `localhost` for testing)
   - Choose your widget mode (Managed, Non-interactive, or Invisible)
   - Copy your **Site Key**

2. **Test Site Keys (Optional for Local Testing)**
   - Always passes: `1x00000000000000000000AA`
   - Always fails: `2x00000000000000000000AB`
   - Forces interactive challenge: `3x00000000000000000000FF`

### 3. Update Configuration

1. **Open `index.html`**
2. **Find the configuration script section (in head)**
3. **Replace the placeholder values:**
   ```javascript
   window.CONFIG = {
       EMAILJS: {
           PUBLIC_KEY: 'your_actual_public_key_here',
           SERVICE_ID: 'your_actual_service_id_here',
           TEMPLATE_ID: 'your_actual_template_id_here'
       },
       TURNSTILE: {
           SITE_KEY: 'your_actual_turnstile_site_key_here'
       }
   };
   ```

### 4. Test the Setup

1. **Start your local server:**
   ```bash
   python3 -m http.server 8000
   ```

2. **Open your portfolio:**
   - Go to `http://localhost:8000`
   - Navigate to the Contact section
   - Fill out the form and verify the Cloudflare Turnstile widget passes
   - Submit the form

3. **Check your email:**
   - You should receive the contact form message in your email

## 🔧 Troubleshooting

### Common Issues:

1. **Turnstile not showing:**
   - Check if your domain is added in Cloudflare Turnstile settings
   - Ensure the Turnstile script is loaded in `<head>`: `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`

2. **EmailJS not working:**
   - Verify all keys are correct in `index.html` configuration
   - Check browser console for errors

3. **Form not submitting:**
   - Check if Cloudflare Turnstile verification is completed
   - Verify all required fields are filled

---

**EmailJS Docs:** [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)  
**Cloudflare Turnstile Docs:** [https://developers.cloudflare.com/turnstile/](https://developers.cloudflare.com/turnstile/)
