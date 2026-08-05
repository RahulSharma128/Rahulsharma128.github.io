# EmailJS and reCAPTCHA Setup Guide

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

### 2. Google reCAPTCHA Setup

1. **Create reCAPTCHA Site**
   - Go to [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
   - Click "Create" to add a new site
   - Choose reCAPTCHA v2 > "I'm not a robot" Checkbox
   - Add your domain (localhost for testing, your actual domain for production)
   - Copy your **Site Key**

### 3. Update Configuration

1. **Open `index.html`**
2. **Find the configuration script section (around line 15-27)**
3. **Replace the placeholder values:**
   ```javascript
   window.CONFIG = {
       EMAILJS: {
           PUBLIC_KEY: 'your_actual_public_key_here',
           SERVICE_ID: 'your_actual_service_id_here',
           TEMPLATE_ID: 'your_actual_template_id_here'
       },
       RECAPTCHA: {
           SITE_KEY: 'your_actual_site_key_here'
       }
   };
   ```

**Note:** The configuration is now embedded directly in the HTML file, making it more secure and eliminating the need for a separate config file.

### 4. Test the Setup

1. **Start your local server:**
   ```bash
   python3 -m http.server 8000
   ```

2. **Open your portfolio:**
   - Go to `http://localhost:8000`
   - Navigate to the Contact section
   - Fill out the form and test it

3. **Check your email:**
   - You should receive the contact form message in your email

## 🔧 Troubleshooting

### Common Issues:

1. **reCAPTCHA not showing:**
   - Check if your domain is added to reCAPTCHA settings
   - For localhost testing, add `localhost` to your reCAPTCHA domains

2. **EmailJS not working:**
   - Verify all keys are correct in `config.js`
   - Check browser console for errors
   - Make sure your email service is properly configured

3. **Form not submitting:**
   - Check if reCAPTCHA is completed
   - Verify all required fields are filled
   - Check browser console for JavaScript errors

## 📧 Email Template Variables

The following variables are available in your EmailJS template:
- `{{from_name}}` - Sender's name
- `{{from_email}}` - Sender's email
- `{{subject}}` - Message subject
- `{{message}}` - Message content
- `{{to_name}}` - Your name (Rahul Sharma)

## 🚀 Production Deployment

When deploying to production:

1. **Update reCAPTCHA domains:**
   - Add your production domain to reCAPTCHA settings
   - Update the site key in your HTML

2. **Update EmailJS:**
   - No changes needed for EmailJS (works with any domain)

3. **Test thoroughly:**
   - Test the contact form on your live site
   - Verify emails are being received

## 📱 Mobile Testing

- Test the contact form on mobile devices
- Ensure reCAPTCHA works properly on mobile
- Check that the form is responsive

## 🔒 Security Notes

- Never expose your EmailJS private keys
- Only the public key should be in your frontend code
- reCAPTCHA provides spam protection
- EmailJS handles the backend email sending securely

---

**Need help?** Check the EmailJS documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
**reCAPTCHA docs:** [https://developers.google.com/recaptcha/docs/](https://developers.google.com/recaptcha/docs/)
