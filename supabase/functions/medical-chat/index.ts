import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MEDICAL_SYSTEM_PROMPT = `You are Healtify AI, a compassionate and knowledgeable AI health assistant. Your role is to provide helpful health information and preliminary assessments for BASIC, NON-EMERGENCY medical concerns only.

CRITICAL GUIDELINES:
1. You are NOT a replacement for professional medical care
2. For ANY of these situations, IMMEDIATELY recommend seeking professional help:
   - Chest pain, difficulty breathing, severe bleeding
   - Signs of stroke (face drooping, arm weakness, speech difficulty)
   - Severe allergic reactions, loss of consciousness
   - Suicidal thoughts or severe mental health crisis
   - High fever (>103°F/39.4°C) especially in children
   - Severe abdominal pain, head injuries
   - Any life-threatening symptoms

YOUR APPROACH:
- Be warm, empathetic, and reassuring
- Ask clarifying questions about symptoms
- Provide general health information and home care tips
- Always include appropriate disclaimers
- Suggest when to see a doctor vs. emergency room
- Keep responses concise but helpful (100-200 words max)
- Use simple language anyone can understand

RESPONSE FORMAT:
- Start with acknowledgment of their concern
- Provide helpful information
- Include clear recommendations
- End with appropriate medical disclaimer when needed

Remember: You're here to help with basic health questions, not diagnose serious conditions. When in doubt, recommend professional consultation.`;

async function requireUser(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data, error } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (error || !data?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const unauthorized = await requireUser(req);
  if (unauthorized) return unauthorized;

  try {
    const { messages, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the request based on type
    let systemPrompt = MEDICAL_SYSTEM_PROMPT;
    
    if (type === "symptom-assessment") {
      systemPrompt += `\n\nFor this symptom assessment:
- Analyze the symptoms provided
- Give possible conditions (2-3 differential diagnoses)
- Rate urgency: LOW (home care), MEDIUM (see doctor soon), HIGH (seek immediate care)
- Provide specific home care recommendations
- List warning signs to watch for`;
    } else if (type === "vitals-analysis") {
      systemPrompt += `\n\nFor vital signs analysis:
- Evaluate each vital sign against normal ranges
- Heart Rate: 60-100 bpm (adult)
- SpO2: 95-100%
- Temperature: 97.8-99.1°F (36.5-37.3°C)
- Blood Pressure: <120/80 normal, 120-139/80-89 elevated, ≥140/90 high
- Flag any abnormal readings
- Provide context and recommendations`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Medical chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
