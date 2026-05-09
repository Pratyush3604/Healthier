// Translate the UI master dictionary into a target language using Lovable AI.
// Public endpoint — no auth required (low-risk read-only translation).
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { language, dict } = await req.json();
    if (!language || typeof language !== 'string' || language.length > 80) {
      return new Response(JSON.stringify({ error: 'invalid language' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!dict || typeof dict !== 'object') {
      return new Response(JSON.stringify({ error: 'invalid dict' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sys = `You are a professional UI localizer for a health app called "Healthier". Translate every value of the provided JSON object into ${language}. Rules:
- Keep the JSON keys EXACTLY the same.
- Translate values naturally and concisely as UI labels (buttons, headings).
- Keep the brand name "Healthier" untranslated.
- Keep "AI", "BMI", "SpO2", "BP", "MRI", "X-ray", "WRO", proper names (Pratyush Dalmia, Mayo College, Akash Deep Rawat, pratyush3604@gmail.com) untranslated.
- Preserve emojis, punctuation and exclamation marks.
- Output ONLY a valid JSON object, no commentary, no markdown fences.`;

    const userMsg = `Translate to ${language}:\n${JSON.stringify(dict)}`;

    const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: userMsg },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      return new Response(JSON.stringify({ error: 'AI error', detail: txt.slice(0, 500) }), {
        status: r.status === 429 ? 429 : 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content ?? '{}';
    let translated: Record<string, string> = {};
    try { translated = JSON.parse(content); } catch { translated = {}; }

    return new Response(JSON.stringify({ language, translated }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
