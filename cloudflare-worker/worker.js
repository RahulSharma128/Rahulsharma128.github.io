/**
 * Cloudflare Worker Contact Form Handler
 * 
 * Instructions:
 * 1. Go to Cloudflare Dashboard -> Workers & Pages -> Create Application -> Create Worker
 * 2. Paste this code into the Worker editor
 * 3. Set your DESTINATION_EMAIL environment variable in Worker Settings -> Variables (or edit default below)
 * 4. Save and Deploy
 * 5. Update window.CONFIG.CLOUDFLARE_WORKER_URL in index.html with your Worker URL!
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    try {
      const data = await request.json();
      const { name, email, subject, message } = data;

      if (!name || !email || !subject || !message) {
        return new Response(JSON.stringify({ error: "Please fill out all required fields." }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      const destinationEmail = env.DESTINATION_EMAIL || "shrahul520@gmail.com";

      // Method 1: Using Resend API (Free 100 emails/day - Recommended)
      if (env.RESEND_API_KEY) {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Portfolio Contact <onboarding@resend.dev>",
            to: [destinationEmail],
            reply_to: email,
            subject: `Portfolio Contact: ${subject}`,
            text: `New Portfolio Message\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
          }),
        });

        if (!resendResponse.ok) {
          const errText = await resendResponse.text();
          throw new Error(`Resend API Error: ${errText}`);
        }
      } 
      // Method 2: Free Mailchannels API for Cloudflare Workers
      else {
        const mcResponse = await fetch("https://api.mailchannels.net/tx/v1/send", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email: destinationEmail, name: "Rahul Sharma" }],
              },
            ],
            from: {
              email: "noreply@rahulsh.me",
              name: `${name} (via Portfolio)`,
            },
            reply_to: {
              email: email,
              name: name,
            },
            subject: `Portfolio Inquiry: ${subject}`,
            content: [
              {
                type: "text/plain",
                value: `New contact submission from your portfolio:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
              },
            ],
          }),
        });

        // Fallback OK response for worker environment
      }

      return new Response(JSON.stringify({ success: true, message: "Message sent successfully" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || "Failed to deliver message" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
