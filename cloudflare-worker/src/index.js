/**
 * Cloudflare Worker API for Rahul's Virtual Self RAG Chatbot
 * Powered by Cloudflare Vectorize + Workers AI (Embeddings) + Google Gemini 2.0 Flash
 */

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Only POST requests are allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    try {
      const body = await request.json();
      
      // Handle Knowledge Ingestion Request into Cloudflare Vectorize DB
      if (body.chunks && Array.isArray(body.chunks)) {
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

      const question = body.question;

      if (!question || typeof question !== "string") {
        return new Response(JSON.stringify({ error: "Missing or invalid question parameter" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      let contextText = "";

      // 1. Generate Question Embedding via Cloudflare Workers AI
      if (env.AI && env.VECTORIZE_INDEX) {
        try {
          const embeddings = await env.AI.run('@cf/baai/bge-small-en-v1.5', {
            text: [question]
          });
          const queryVector = embeddings.data[0];

          // 2. Query Cloudflare Vectorize Index
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

      // 3. Fallback Context if Vectorize index isn't populated yet
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
  - Full Stack Engineer at Smartgenx/Volyo Solutions (Sept 2024 - Present): Next.js dashboards, PWAs, Firebase.
  - Software Engineer at Emvirt Solutions (May 2024 - Aug 2024): Drone Fleet Monitoring GCS, WebSockets, Azure 3D Maps.
  - Node.js Developer Intern at JPloft (Jan 2024 - Apr 2024): Express microservices, REST APIs, Sequelize, MySQL/MongoDB.
FEATURED PROJECTS:
  - PathSynq: Pothole & Road Jerk Detector PWA using mobile sensors & Mapbox GL (Demo: http://pathsynq.rahulsh.me/)
  - Drone Fleet Monitoring GCS: Real-time telemetry streaming with Azure 3D Maps.
  - Partner & Admin Dashboards: Scalable Next.js dashboards with Chart.js & ApexCharts.
`;
      }

      // 4. Construct System Prompt & Call Gemini 2.0 Flash API
      const systemPrompt = `You are Rahul Sharma's AI Virtual Self (Digital Twin) speaking directly on his portfolio website.
- Answer in the first person ("I", "my experience", "projects I've built", "my email is shrahul520@gmail.com").
- Be concise, enthusiastic, professional, and helpful.
- Keep answers under 3-4 sentences unless detailed code or project breakdown is requested.
- If asked about contact info, mention email (shrahul520@gmail.com) and LinkedIn.
- If asked about education or CGPA, mention B.Tech CSE at JECRC College (CGPA: 7.94).

RELEVANT KNOWLEDGE CONTEXT:
${contextText}`;

      let aiResponseText = "";

      if (env.GEMINI_API_KEY) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;
        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: systemPrompt }] },
              { role: "user", parts: [{ text: question }] }
            ]
          })
        });

        const geminiData = await geminiRes.json();
        if (geminiData.candidates && geminiData.candidates[0].content) {
          aiResponseText = geminiData.candidates[0].content.parts[0].text;
        }
      }

      // Fallback if GEMINI_API_KEY not configured yet
      if (!aiResponseText) {
        aiResponseText = `Hey! I'm Rahul's Virtual Self AI. I'm currently running on Cloudflare Edge! Feel free to ask me about my work experience (3+ years), B.Tech CSE degree (7.94 CGPA), projects like PathSynq, or reach out to me directly at shrahul520@gmail.com!`;
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
