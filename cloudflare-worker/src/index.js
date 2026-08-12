/**
 * Cloudflare Worker API for Rahul's Virtual Self RAG Chatbot
 * Secured with Rate Limiting, Origin Controls & Input Sanitization
 * Powered by Cloudflare Vectorize + Workers AI + Google Gemini 2.0 Flash
 */

// In-memory sliding window rate limiter (per Cloudflare Worker isolate)
const ipRateMap = new Map();

function checkRateLimit(ip, limit = 5, windowMs = 60000) {
  const now = Date.now();
  // Periodically cleanup expired IPs to keep memory footprint tiny
  if (ipRateMap.size > 1000) {
    for (const [k, timestamps] of ipRateMap.entries()) {
      if (timestamps.every(t => now - t > windowMs)) {
        ipRateMap.delete(k);
      }
    }
  }

  const userTimestamps = (ipRateMap.get(ip) || []).filter(t => now - t < windowMs);
  if (userTimestamps.length >= limit) {
    return true; // Exceeded limit
  }

  userTimestamps.push(now);
  ipRateMap.set(ip, userTimestamps);
  return false;
}

// Allowed CORS Origins
const ALLOWED_ORIGINS = [
  "https://rahulsharma128.github.io",
  "http://rahulsharma128.github.io",
  "http://pathsynq.rahulsh.me",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000"
];

function getCorsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-key",
    "Access-Control-Max-Age": "86400"
  };
}

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = getCorsHeaders(request);

    // 1. Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Only POST requests are allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. IP Rate Limiting (5 requests per minute per IP to protect Gemini & CF Free Tiers)
    const clientIp = request.headers.get("CF-Connecting-IP") || request.headers.get("x-real-ip") || "unknown";
    if (checkRateLimit(clientIp, 5, 60000)) {
      return new Response(JSON.stringify({
        error: "Rate limit exceeded",
        message: "You've sent too many questions in a short time. Please wait a minute before asking again!"
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": "60"
        }
      });
    }

    try {
      const body = await request.json();

      // 3. Secure Knowledge Ingestion Route (Requires Admin Header)
      if (body.chunks && Array.isArray(body.chunks)) {
        const adminKey = request.headers.get("x-admin-key");
        if (!env.ADMIN_SECRET || adminKey !== env.ADMIN_SECRET) {
          return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid admin key for ingestion" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        if (!env.AI || !env.VECTORIZE_INDEX) {
          return new Response(JSON.stringify({ error: "Vectorize DB binding missing" }), { status: 500, headers: corsHeaders });
        }
        
        const vectors = [];
        for (let i = 0; i < body.chunks.length; i++) {
          const chunk = body.chunks[i];
          const embedRes = await env.AI.run('@cf/baai/bge-small-en-v1.5', { text: [chunk.text] });
          vectors.push({
            id: chunk.id || `chunk-${i}`,
            values: embedRes.data[0],
            metadata: { text: chunk.text, title: chunk.title || "Portfolio Data" }
          });
        }
        
        await env.VECTORIZE_INDEX.upsert(vectors);
        return new Response(JSON.stringify({ success: true, count: vectors.length }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 4. Validate & Sanitize Question Input
      let question = body.question;

      if (!question || typeof question !== "string") {
        return new Response(JSON.stringify({ error: "Missing or invalid question parameter" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      question = question.trim();
      if (question.length === 0) {
        return new Response(JSON.stringify({ error: "Question cannot be empty" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Max input length cap (500 chars) to prevent prompt bloat / token drain abuse
      if (question.length > 500) {
        question = question.substring(0, 500);
      }

      let contextText = "";

      // 5. Generate Question Embedding via Cloudflare Workers AI
      if (env.AI && env.VECTORIZE_INDEX) {
        try {
          const embeddings = await env.AI.run('@cf/baai/bge-small-en-v1.5', {
            text: [question]
          });
          const queryVector = embeddings.data[0];

          // Query Vectorize Index
          const vectorMatches = await env.VECTORIZE_INDEX.query(queryVector, { topK: 4 });
          if (vectorMatches && vectorMatches.matches) {
            contextText = vectorMatches.matches
              .map(m => m.metadata ? m.metadata.text : "")
              .filter(Boolean)
              .join("\n\n---\n\n");
          }
        } catch (vErr) {
          console.warn("Vector search fallback triggered:", vErr);
        }
      }

      // Fallback Context if Vectorize index isn't populated yet
      if (!contextText) {
        contextText = `
NAME: Rahul Sharma
ROLE: Full Stack Developer (MERN, Next.js, Microservices)
LOCATION: Jaipur, Rajasthan, India
EMAIL: shrahul520@gmail.com
LINKEDIN: https://www.linkedin.com/in/rahul-sharma-b02486224/
GITHUB: https://github.com/RahulSharma128
EDUCATION: B.Tech Computer Science Engineering, JECRC College, Jaipur (2019-2023), CGPA: 7.94
EXPERIENCE: 3+ Years total experience
  - Full Stack Developer at JPloft (June 2025 - Present): Gemini API LLM chatbots, REST API optimization, Docker Compose, CI/CD, Stripe payments.
  - Full Stack Developer at Emvirt Solutions (May 2024 - May 2025): YOLOv5 object detection pipeline, MediaMTX WebRTC streaming, Deck.gl & Azure Maps 3D drone tracking.
  - Full Stack Developer at Volyo Solutions (Sept 2023 - May 2024): Next.js unified partner dashboards, Offline-First PWAs using Firebase.
FEATURED PROJECTS:
  - PathSynq: Pothole & Road Jerk Detector PWA using mobile sensors & Mapbox GL (Demo: http://pathsynq.rahulsh.me/)
  - Drone Fleet Monitoring GCS: Real-time telemetry streaming with Azure 3D Maps.
  - Partner & Admin Dashboards: Scalable Next.js dashboards with Chart.js & ApexCharts.
`;
      }

      // 6. Construct System Prompt & Call Gemini 2.0 Flash API
      const systemPrompt = `You are Rahul Sharma's AI Virtual Self (Digital Twin) speaking directly on his portfolio website.
- Answer in the first person ("I", "my experience", "projects I've built", "my email is shrahul520@gmail.com").
- Be concise, enthusiastic, professional, and helpful.
- Keep answers under 3-4 sentences unless detailed code or project breakdown is requested.
- If asked about contact info, mention email (shrahul520@gmail.com) and LinkedIn.
- If asked about education or CGPA, mention B.Tech CSE at JECRC College (CGPA: 7.94).

RELEVANT KNOWLEDGE CONTEXT:
${contextText}`;

      let aiResponseText = "";

      // Call Gemini API if GEMINI_API_KEY secret is set
      if (env.GEMINI_API_KEY) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;
          const geminiRes = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                { role: "user", parts: [{ text: `${systemPrompt}\n\nUSER QUESTION: ${question}` }] }
              ]
            })
          });

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            if (geminiData.candidates && geminiData.candidates[0]?.content?.parts?.[0]?.text) {
              aiResponseText = geminiData.candidates[0].content.parts[0].text;
            }
          } else if (geminiRes.status === 429) {
            console.warn("Gemini API rate limit hit (429), falling back to Cloudflare Workers AI...");
          }
        } catch (gErr) {
          console.warn("Gemini API call failed, falling back to Workers AI:", gErr);
        }
      }

      // Use Cloudflare Workers AI as native free LLM engine if Gemini unavailable/failed
      if (!aiResponseText && env.AI) {
        try {
          const aiRes = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: question }
            ]
          });
          if (aiRes && aiRes.response) {
            aiResponseText = aiRes.response;
          }
        } catch (cfAiErr) {
          console.error("Workers AI LLM Error:", cfAiErr);
        }
      }

      // Fallback if LLM models fail
      if (!aiResponseText) {
        aiResponseText = `I'm Rahul's Virtual AI Twin! I specialize in full-stack web development (MERN, Next.js, PWAs, Microservices). Ask me about my projects like PathSynq, my B.Tech degree (7.94 CGPA), or reach me at shrahul520@gmail.com!`;
      }

      return new Response(JSON.stringify({ answer: aiResponseText }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (error) {
      console.error("Worker Execution Error:", error);
      return new Response(JSON.stringify({ error: "Internal Edge Error", message: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};

